import { groqClient } from '../config/groq';
import { symptomRepository } from '../repositories/symptom.repository';
import { patientRepository } from '../repositories/patient.repository';
import { ValidationError } from '../utils/errors';
import { logger } from '../utils/logger';
import type { TextTriageInput } from '../schemas/triage.schema';
import type { Readable } from 'stream';

// This is what Groq returns after analysis
export interface TriageResult {
  report_id: string;
  urgency_level: 'low' | 'medium' | 'emergency';
  recommended_specialist: string;
  symptoms_structured: Array<{
    symptom: string;
    duration?: string;
    severity?: string;
  }>;
  advice: string;
  transcription?: string; // only for voice triage
  raw_symptoms: string;
  created_at: string;
}

// Language display names for the prompt
const LANGUAGE_NAMES: Record<string, string> = {
  en: 'English',
  hi: 'Hindi',
  pa: 'Punjabi',
};

export class TriageService {
  // ─── Core AI Analysis ─────────────────────────────────────────
  private async analyzeSymptoms(
    symptomsText: string,
    language: string
  ): Promise<{
    urgency_level: 'low' | 'medium' | 'emergency';
    recommended_specialist: string;
    symptoms_structured: Array<{
      symptom: string;
      duration?: string;
      severity?: string;
    }>;
    advice: string;
  }> {
    const prompt = `You are a medical triage assistant for rural India. Analyze the following patient symptoms and respond ONLY with a valid JSON object — no explanation, no markdown, no extra text.

Patient symptoms (in ${LANGUAGE_NAMES[language] ?? 'English'}):
"${symptomsText}"

Respond with exactly this JSON structure:
{
  "urgency_level": "low" | "medium" | "emergency",
  "recommended_specialist": "string (e.g. General Physician, Cardiologist, Pediatrician)",
  "symptoms_structured": [
    { "symptom": "string", "duration": "string or null", "severity": "mild|moderate|severe or null" }
  ],
  "advice": "string (1-2 sentences of immediate advice in simple language)"
}

Rules:
- urgency_level "emergency" = life threatening, needs immediate hospital visit
- urgency_level "medium" = needs doctor within 24 hours
- urgency_level "low" = can be managed with rest/OTC medicine, see doctor if no improvement
- recommended_specialist must be a real medical specialty
- advice must be in ${LANGUAGE_NAMES[language] ?? 'English'} and simple enough for a rural patient to understand
- Never diagnose. Only triage.`;

    const completion = await groqClient.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.1, // low temperature = consistent, structured output
      max_tokens: 500,
    });

    const rawResponse = completion.choices[0]?.message?.content ?? '';

    logger.info({ rawResponse }, 'Groq triage response');

    // Strip markdown code fences if model adds them despite instructions
    const cleaned = rawResponse
      .replace(/```json/g, '')
      .replace(/```/g, '')
      .trim();

    try {
      const parsed = JSON.parse(cleaned);

      // Validate urgency level is one of the three allowed values
      if (!['low', 'medium', 'emergency'].includes(parsed.urgency_level)) {
        parsed.urgency_level = 'medium'; // safe default
      }

      return parsed;
    } catch {
      logger.error({ rawResponse }, 'Failed to parse Groq response as JSON');
      throw new ValidationError('AI analysis failed — please try again');
    }
  }

  // ─── Text Triage ──────────────────────────────────────────────
  async triageText(
    input: TextTriageInput,
    requestingUserId: string
  ): Promise<TriageResult> {
    // Get patient profile for village_id (used in outbreak detection later)
    const patient = await patientRepository.findByUserId(requestingUserId);

    // Run AI analysis
    const analysis = await this.analyzeSymptoms(input.symptoms, input.language);

    // Save report to DB
    const report = await symptomRepository.create({
      patient_id: input.patientId ?? patient?.patient_id,
      village_id: (patient as any)?.village_id ?? undefined,
      symptoms_raw: input.symptoms,
      symptoms_structured: analysis.symptoms_structured,
      urgency_level: analysis.urgency_level,
      language: input.language,
    });

    return {
      report_id: report.report_id,
      urgency_level: analysis.urgency_level,
      recommended_specialist: analysis.recommended_specialist,
      symptoms_structured: analysis.symptoms_structured,
      advice: analysis.advice,
      raw_symptoms: input.symptoms,
      created_at: report.created_at,
    };
  }

  // ─── Voice Triage ─────────────────────────────────────────────
  async triageVoice(
    fileBuffer: Buffer,
    mimetype: string,
    language: string,
    requestingUserId: string,
    patientId?: string
  ): Promise<TriageResult> {
    // Step 1: Transcribe audio using Groq Whisper
    let transcription: string;

    try {
      // Groq SDK expects a File-like object
      const arrayBuffer = fileBuffer.buffer.slice(
  fileBuffer.byteOffset,
  fileBuffer.byteOffset + fileBuffer.byteLength
) as ArrayBuffer;

const file = new File([arrayBuffer], 'audio.webm', { type: mimetype });
      const transcriptionResponse = await groqClient.audio.transcriptions.create({
        file,
        model: 'whisper-large-v3',
        language: language === 'pa' ? 'hi' : language, // Whisper uses 'hi' for Punjabi too
        response_format: 'text',
      });

      transcription = transcriptionResponse as unknown as string;
      logger.info({ transcription }, 'Whisper transcription complete');
    } catch (err) {
      logger.error({ err }, 'Whisper transcription failed');
      throw new ValidationError('Voice transcription failed — please try again or use text input');
    }

    if (!transcription || transcription.trim().length < 3) {
      throw new ValidationError('Could not understand audio — please speak clearly and try again');
    }

    // Step 2: Run same analysis pipeline as text triage
    const patient = await patientRepository.findByUserId(requestingUserId);
    const analysis = await this.analyzeSymptoms(transcription, language);

    const report = await symptomRepository.create({
      patient_id: patientId ?? patient?.patient_id,
      village_id: (patient as any)?.village_id ?? undefined,
      symptoms_raw: transcription,
      symptoms_structured: analysis.symptoms_structured,
      urgency_level: analysis.urgency_level,
      language,
    });

    return {
      report_id: report.report_id,
      urgency_level: analysis.urgency_level,
      recommended_specialist: analysis.recommended_specialist,
      symptoms_structured: analysis.symptoms_structured,
      advice: analysis.advice,
      transcription, // include transcription so frontend can show "we heard: ..."
      raw_symptoms: transcription,
      created_at: report.created_at,
    };
  }

  // ─── Get Report ───────────────────────────────────────────────
  async getReport(reportId: string) {
    const report = await symptomRepository.findById(reportId);
    if (!report) {
      throw new ValidationError('Report not found');
    }
    return report;
  }
}

export const triageService = new TriageService();