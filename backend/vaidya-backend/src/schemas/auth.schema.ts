import { z } from 'zod';

export const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  phone: z
    .string()
    .regex(/^[6-9]\d{9}$/, 'Enter a valid 10-digit Indian mobile number'),
  email: z.string().email().optional(),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  role: z.enum(['patient', 'doctor', 'pharmacy', 'asha', 'admin']),
  villageId: z.string().uuid().nullish().transform(val => val ?? undefined),
  specialization: z.string().optional(),
  hospitalId: z.string().uuid().optional(),
  // ADD THESE — used by ASHA worker registration and sync
  bloodGroup: z.enum(['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']).optional(),
  dateOfBirth: z.string().optional(),
  gender: z.enum(['male', 'female', 'other']).optional(),
  allergies: z.array(z.string()).optional().default([]),
});

export const loginSchema = z.object({
  phone: z.string().min(3, 'Enter a valid phone number or email'),
  password: z.string().min(1, 'Password is required'),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;