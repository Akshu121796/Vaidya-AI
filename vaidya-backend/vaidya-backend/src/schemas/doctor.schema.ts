import { z } from 'zod';

export const updateAvailabilitySchema = z.object({
  isAvailable: z.boolean(),
  avgWaitMinutes: z.number().min(0).max(300).optional(),
});

export const listDoctorsSchema = z.object({
  specialization: z.string().optional(),
  villageId: z.string().uuid().optional(),
  available: z
    .string()
    .optional()
    .transform((val) => {
      if (val === 'true') return true;
      if (val === 'false') return false;
      return undefined;
    }),
});

export type UpdateAvailabilityInput = z.infer<typeof updateAvailabilitySchema>;
export type ListDoctorsInput = z.infer<typeof listDoctorsSchema>;