import { z } from 'zod';

export const registerPatientSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  phone: z
    .string()
    .regex(/^[6-9]\d{9}$/, 'Enter a valid 10-digit Indian mobile number'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  villageId: z.string().uuid().nullish().transform((val) => val ?? undefined),
  bloodGroup: z
    .enum(['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'])
    .optional(),
  dateOfBirth: z.string().optional(),
  gender: z.enum(['male', 'female', 'other']).optional(),
  allergies: z.array(z.string()).optional().default([]),
});

export const updatePatientSchema = z.object({
  bloodGroup: z
    .enum(['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'])
    .optional(),
  dateOfBirth: z.string().optional(),
  gender: z.enum(['male', 'female', 'other']).optional(),
  allergies: z.array(z.string()).optional(),
  villageId: z.string().uuid().optional(),
});

export type RegisterPatientInput = z.infer<typeof registerPatientSchema>;
export type UpdatePatientInput = z.infer<typeof updatePatientSchema>;