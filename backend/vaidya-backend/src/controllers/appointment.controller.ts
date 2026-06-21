import type { FastifyRequest, FastifyReply } from 'fastify';
import { appointmentService } from '../services/appointment.service';
import {
  bookAppointmentSchema,
  updateAppointmentStatusSchema,
} from '../schemas/appointment.schema';
import { successResponse } from '../utils/response';
import { ValidationError } from '../utils/errors';

export class AppointmentController {
  async bookAppointment(request: FastifyRequest, reply: FastifyReply) {
    const parsed = bookAppointmentSchema.safeParse(request.body);
    if (!parsed.success) {
      throw new ValidationError(
        parsed.error.issues.map((e) => e.message).join(', ')
      );
    }

    const appointment = await appointmentService.bookAppointment(
      parsed.data,
      request.user.userId
    );

    return reply.status(201).send(successResponse({ appointment }));
  }

  async getAppointmentById(
    request: FastifyRequest<{ Params: { id: string } }>,
    reply: FastifyReply
  ) {
    const appointment = await appointmentService.getAppointmentById(
      request.params.id,
      request.user.userId,
      request.user.role
    );
    return reply.send(successResponse({ appointment }));
  }

  async updateStatus(
    request: FastifyRequest<{ Params: { id: string } }>,
    reply: FastifyReply
  ) {
    const parsed = updateAppointmentStatusSchema.safeParse(request.body);
    if (!parsed.success) {
      throw new ValidationError(
        parsed.error.issues.map((e) => e.message).join(', ')
      );
    }

    const appointment = await appointmentService.updateStatus(
      request.params.id,
      parsed.data,
      request.user.userId,
      request.user.role
    );

    return reply.send(successResponse({ appointment }));
  }

  async getPatientAppointments(
    request: FastifyRequest<{ Params: { patientId: string } }>,
    reply: FastifyReply
  ) {
    const appointments = await appointmentService.getPatientAppointments(
      request.params.patientId,
      request.user.userId,
      request.user.role
    );
    return reply.send(successResponse({ appointments }));
  }
}

export const appointmentController = new AppointmentController();