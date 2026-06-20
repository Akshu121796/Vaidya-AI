import type { FastifyRequest, FastifyReply } from 'fastify';
import { prescriptionService } from '../services/prescription.service';
import { createPrescriptionSchema } from '../schemas/prescription.schema';
import { successResponse } from '../utils/response';
import { ValidationError } from '../utils/errors';

export class PrescriptionController {
  async createPrescription(request: FastifyRequest, reply: FastifyReply) {
    const parsed = createPrescriptionSchema.safeParse(request.body);
    if (!parsed.success) {
      throw new ValidationError(
        parsed.error.issues.map((e) => e.message).join(', ')
      );
    }

    const prescription = await prescriptionService.createPrescription(
      parsed.data,
      request.user.userId,
      request.user.role
    );

    return reply.status(201).send(successResponse({ prescription }));
  }

  async getPrescriptionById(
    request: FastifyRequest<{ Params: { id: string } }>,
    reply: FastifyReply
  ) {
    const { id } = request.params;
    const prescription = await prescriptionService.getPrescriptionById(
      id,
      request.user.userId,
      request.user.role
    );

    return reply.send(successResponse({ prescription }));
  }

  async getPrescriptionsByPatientId(
    request: FastifyRequest<{ Params: { id: string } }>,
    reply: FastifyReply
  ) {
    const { id } = request.params;
    const prescriptions = await prescriptionService.getPrescriptionsByPatientId(
      id,
      request.user.userId,
      request.user.role
    );

    return reply.send(successResponse({ prescriptions }));
  }

  async dispensePrescription(
    request: FastifyRequest<{ Params: { id: string } }>,
    reply: FastifyReply
  ) {
    const { id } = request.params;
    const prescription = await prescriptionService.dispensePrescription(
      id,
      request.user.userId,
      request.user.role
    );

    return reply.send(successResponse({ prescription }));
  }
}

export const prescriptionController = new PrescriptionController();
