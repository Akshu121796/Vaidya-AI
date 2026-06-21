import { z } from 'zod';

export const addMedicineSchema = z.object({
  name: z.string().min(2, 'Medicine name is required'),
  genericName: z.string().optional(),
  quantity: z.number().int().min(0).default(0),
  price: z.number().min(0).optional(),
});

export const updateMedicineSchema = z.object({
  quantity: z.number().int().min(0).optional(),
  price: z.number().min(0).optional(),
  genericName: z.string().optional(),
});

export const searchMedicineSchema = z.object({
  name: z.string().min(1, 'Search term is required'),
  villageId: z.string().uuid().optional(),
});

export type AddMedicineInput = z.infer<typeof addMedicineSchema>;
export type UpdateMedicineInput = z.infer<typeof updateMedicineSchema>;
export type SearchMedicineInput = z.infer<typeof searchMedicineSchema>;