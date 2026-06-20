import type { FastifyRequest, FastifyReply } from 'fastify';
import { patientService } from '../services/patient.service';
import {
  registerPatientSchema,
  updatePatientSchema,
} from '../schemas/patient.schema';
import { successResponse } from '../utils/response';
import { ValidationError } from '../utils/errors';

export class PatientController {
  async registerByAsha(request: FastifyRequest, reply: FastifyReply) {
    const parsed = registerPatientSchema.safeParse(request.body);
    if (!parsed.success) {
      throw new ValidationError(
        parsed.error.issues.map((e) => e.message).join(', ')
      );
    }

    const result = await patientService.registerByAsha(
      parsed.data,
      request.user.userId
    );

    return reply.status(201).send(successResponse(result));
  }

  async getPatientById(
    request: FastifyRequest<{ Params: { id: string } }>,
    reply: FastifyReply
  ) {
    const { id } = request.params;

    const patient = await patientService.getPatientById(
      id,
      request.user.userId,
      request.user.role
    );

    return reply.send(successResponse({ patient }));
  }

  async getPatientByQrToken(
    request: FastifyRequest<{ Params: { token: string } }>,
    reply: FastifyReply
  ) {
    const { token } = request.params;
    const patient = await patientService.getPatientByQrToken(token);
    return reply.send(successResponse({ patient }));
  }

  async updatePatient(
    request: FastifyRequest<{ Params: { id: string } }>,
    reply: FastifyReply
  ) {
    const parsed = updatePatientSchema.safeParse(request.body);
    if (!parsed.success) {
      throw new ValidationError(
        parsed.error.issues.map((e) => e.message).join(', ')
      );
    }

    const patient = await patientService.updatePatient(
      request.params.id,
      parsed.data,
      request.user.userId,
      request.user.role
    );

    return reply.send(successResponse({ patient }));
  }

  async getPatientHistory(
    request: FastifyRequest<{ Params: { id: string } }>,
    reply: FastifyReply
  ) {
    const history = await patientService.getPatientHistory(
      request.params.id,
      request.user.userId,
      request.user.role
    );

    return reply.send(successResponse(history));
  }

  async getMyProfile(request: FastifyRequest, reply: FastifyReply) {
    const patient = await patientService.getMyProfile(request.user.userId);
    return reply.send(successResponse({ patient }));
  }
}

export const patientController = new PatientController();