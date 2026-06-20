import { z } from 'zod';

export const bookAppointmentSchema = z.object({
  doctorId: z.string().uuid('Invalid doctor ID'),
  scheduledAt: z.string().datetime('Must be a valid ISO datetime'),
  notes: z.string().max(500).optional(),
  telegramChatId: z.string().optional(), // patient's telegram for notifications
});

export const updateAppointmentStatusSchema = z.object({
  status: z.enum(['confirmed', 'completed', 'cancelled']),
});

export type BookAppointmentInput = z.infer<typeof bookAppointmentSchema>;
export type UpdateAppointmentStatusInput = z.infer<typeof updateAppointmentStatusSchema>;