import type { FastifyRequest, FastifyReply } from 'fastify';
import { triageService } from '../services/triage.service';
import { textTriageSchema } from '../schemas/triage.schema';
import { successResponse } from '../utils/response';
import { ValidationError } from '../utils/errors';

export class TriageController {
  async triageText(request: FastifyRequest, reply: FastifyReply) {
    const parsed = textTriageSchema.safeParse(request.body);
    if (!parsed.success) {
      throw new ValidationError(
        parsed.error.issues.map((e) => e.message).join(', ')
      );
    }

    const result = await triageService.triageText(
      parsed.data,
      request.user.userId
    );

    return reply.status(201).send(successResponse({ triage: result }));
  }

  async triageVoice(request: FastifyRequest, reply: FastifyReply) {
    // Parse multipart form data
    const data = await request.file();

    if (!data) {
      throw new ValidationError('No audio file provided');
    }

    // Validate file type
    const allowedTypes = ['audio/webm', 'audio/mp4', 'audio/mpeg', 'audio/wav', 'audio/ogg'];
    if (!allowedTypes.includes(data.mimetype)) {
      throw new ValidationError(
        'Invalid file type. Supported: webm, mp4, mp3, wav, ogg'
      );
    }

    // Read file into buffer
    const chunks: Buffer[] = [];
    for await (const chunk of data.file) {
      chunks.push(chunk);
    }
    const fileBuffer = Buffer.concat(chunks);

    if (fileBuffer.length === 0) {
      throw new ValidationError('Audio file is empty');
    }

    // Get language from form fields (default to English)
    const language = (data.fields as any)?.language?.value ?? 'en';
    const patientId = (data.fields as any)?.patientId?.value;

    const result = await triageService.triageVoice(
      fileBuffer,
      data.mimetype,
      language,
      request.user.userId,
      patientId
    );

    return reply.status(201).send(successResponse({ triage: result }));
  }

  async getReport(
    request: FastifyRequest<{ Params: { id: string } }>,
    reply: FastifyReply
  ) {
    const report = await triageService.getReport(request.params.id);
    return reply.send(successResponse({ report }));
  }
}

export const triageController = new TriageController();