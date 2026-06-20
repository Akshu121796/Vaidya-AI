import type { FastifyRequest, FastifyReply } from 'fastify';
import { doctorService } from '../services/doctor.service';
import {
  updateAvailabilitySchema,
  listDoctorsSchema,
} from '../schemas/doctor.schema';
import { successResponse } from '../utils/response';
import { ValidationError } from '../utils/errors';

export class DoctorController {
  async listDoctors(request: FastifyRequest, reply: FastifyReply) {
    const parsed = listDoctorsSchema.safeParse(request.query);
    if (!parsed.success) {
      throw new ValidationError(
        parsed.error.issues.map((e) => e.message).join(', ')
      );
    }

    const doctors = await doctorService.listDoctors(parsed.data);
    return reply.send(successResponse({ doctors }));
  }

  async getDoctorById(
    request: FastifyRequest<{ Params: { id: string } }>,
    reply: FastifyReply
  ) {
    const doctor = await doctorService.getDoctorById(request.params.id);
    return reply.send(successResponse({ doctor }));
  }

  async updateAvailability(
    request: FastifyRequest<{ Params: { id: string } }>,
    reply: FastifyReply
  ) {
    const parsed = updateAvailabilitySchema.safeParse(request.body);
    if (!parsed.success) {
      throw new ValidationError(
        parsed.error.issues.map((e) => e.message).join(', ')
      );
    }

    const doctor = await doctorService.updateAvailability(
      request.params.id,
      parsed.data,
      request.user.userId,
      request.user.role
    );

    return reply.send(successResponse({ doctor }));
  }

  async getDoctorAppointments(
    request: FastifyRequest<{ Params: { id: string } }>,
    reply: FastifyReply
  ) {
    const appointments = await doctorService.getDoctorAppointments(
      request.params.id,
      request.user.userId,
      request.user.role
    );

    return reply.send(successResponse({ appointments }));
  }

  async getMyProfile(request: FastifyRequest, reply: FastifyReply) {
    const doctor = await doctorService.getMyProfile(request.user.userId);
    return reply.send(successResponse({ doctor }));
  }
}

export const doctorController = new DoctorController();