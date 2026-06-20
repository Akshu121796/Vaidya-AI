import { z } from 'zod';

export const textTriageSchema = z.object({
  symptoms: z.string().min(5, 'Please describe your symptoms in more detail'),
  language: z.enum(['en', 'hi', 'pa']).default('en'),
  patientId: z.string().uuid().optional(), // optional — ASHA may submit on behalf
});

export const voiceTriageSchema = z.object({
  language: z.enum(['en', 'hi', 'pa']).default('en'),
  patientId: z.string().uuid().optional(),
});

export type TextTriageInput = z.infer<typeof textTriageSchema>;
export type VoiceTriageInput = z.infer<typeof voiceTriageSchema>;