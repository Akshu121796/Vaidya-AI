import { z } from 'zod';

export const createPrescriptionSchema = z.object({
  appointmentId: z.string().uuid().optional().nullable(),
  patientId: z.string().uuid(),
  doctorId: z.string().uuid(),
  medicines: z.array(
    z.object({
      name: z.string().min(1, 'Medicine name cannot be empty'),
      dosage: z.string().min(1, 'Dosage instructions cannot be empty'),
      duration: z.string().min(1, 'Duration cannot be empty'),
      quantity: z.number().int().positive().optional(),
    })
  ).min(1, 'Please prescribe at least one medicine agent.'),
  notes: z.string().optional().nullable(),
});

export type CreatePrescriptionInput = z.infer<typeof createPrescriptionSchema>;
