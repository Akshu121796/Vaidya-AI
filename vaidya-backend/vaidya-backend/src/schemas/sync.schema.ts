import { z } from 'zod';

// Each offline record has a type and a payload
const patientRecordSchema = z.object({
  type: z.literal('PATIENT_REGISTRATION'),
  offlineId: z.string(), // client-generated ID for deduplication
  timestamp: z.string().datetime(),
  payload: z.object({
    name: z.string().min(2),
    phone: z.string().regex(/^[6-9]\d{9}$/),
    password: z.string().min(6),
    villageId: z.string().uuid().optional(),
    bloodGroup: z.enum(['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']).optional(),
    dateOfBirth: z.string().optional(),
    gender: z.enum(['male', 'female', 'other']).optional(),
    allergies: z.array(z.string()).optional().default([]),
  }),
});

const symptomRecordSchema = z.object({
  type: z.literal('SYMPTOM_REPORT'),
  offlineId: z.string(),
  timestamp: z.string().datetime(),
  payload: z.object({
    patientPhone: z.string(), // link by phone since patient_id may not exist yet
    symptoms: z.string().min(3),
    language: z.enum(['en', 'hi', 'pa']).default('en'),
    villageId: z.string().uuid().optional(),
  }),
});

const appointmentRecordSchema = z.object({
  type: z.literal('APPOINTMENT_BOOKING'),
  offlineId: z.string(),
  timestamp: z.string().datetime(),
  payload: z.object({
    patientPhone: z.string(),
    doctorId: z.string().uuid(),
    scheduledAt: z.string().datetime(),
    notes: z.string().optional(),
  }),
});

// Union — each record in the batch can be any of these types
export const syncRecordSchema = z.discriminatedUnion('type', [
  patientRecordSchema,
  symptomRecordSchema,
  appointmentRecordSchema,
]);

export const syncBatchSchema = z.object({
  records: z
    .array(syncRecordSchema)
    .min(1, 'Batch must contain at least one record')
    .max(100, 'Maximum 100 records per batch'),
  ashaId: z.string().uuid(), // the ASHA worker submitting this batch
});

export type SyncRecord = z.infer<typeof syncRecordSchema>;
export type SyncBatchInput = z.infer<typeof syncBatchSchema>;