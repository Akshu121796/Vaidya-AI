import type { FastifyRequest, FastifyReply } from 'fastify';
import { medicineService } from '../services/medicine.service';
import {
  addMedicineSchema,
  updateMedicineSchema,
  searchMedicineSchema,
} from '../schemas/medicine.schema';
import { successResponse } from '../utils/response';
import { ValidationError } from '../utils/errors';

export class MedicineController {
  async searchMedicines(request: FastifyRequest, reply: FastifyReply) {
    const parsed = searchMedicineSchema.safeParse(request.query);
    if (!parsed.success) {
      throw new ValidationError(
        parsed.error.issues.map((e) => e.message).join(', ')
      );
    }

    const medicines = await medicineService.searchMedicines(parsed.data);
    return reply.send(successResponse({ medicines }));
  }

  async getPharmacyMedicines(
    request: FastifyRequest<{ Params: { id: string } }>,
    reply: FastifyReply
  ) {
    const medicines = await medicineService.getPharmacyMedicines(request.params.id);
    return reply.send(successResponse({ medicines }));
  }

  async addMedicine(request: FastifyRequest, reply: FastifyReply) {
    const parsed = addMedicineSchema.safeParse(request.body);
    if (!parsed.success) {
      throw new ValidationError(
        parsed.error.issues.map((e) => e.message).join(', ')
      );
    }

    const medicine = await medicineService.addMedicine(
      parsed.data,
      request.user.userId
    );
    return reply.status(201).send(successResponse({ medicine }));
  }

  async updateMedicine(
    request: FastifyRequest<{ Params: { id: string } }>,
    reply: FastifyReply
  ) {
    const parsed = updateMedicineSchema.safeParse(request.body);
    if (!parsed.success) {
      throw new ValidationError(
        parsed.error.issues.map((e) => e.message).join(', ')
      );
    }

    const medicine = await medicineService.updateMedicine(
      request.params.id,
      parsed.data,
      request.user.userId
    );
    return reply.send(successResponse({ medicine }));
  }
}

export const medicineController = new MedicineController();