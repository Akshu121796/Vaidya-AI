import type { FastifyInstance } from 'fastify';
import { appointmentController } from '../controllers/appointment.controller';
import { authenticate } from '../middleware/authenticate';
import { authorize } from '../middleware/authorize';

export async function appointmentRoutes(app: FastifyInstance) {
  // Book appointment — patients only
  app.post(
    '/',
    { preHandler: [authenticate, authorize('patient')] },
    (req, reply) => appointmentController.bookAppointment(req, reply)
  );

  // Get appointment by ID — any authenticated user
  app.get(
    '/:id',
    { preHandler: [authenticate] },
    (req: any, reply) => appointmentController.getAppointmentById(req, reply)
  );

  // Update status — doctor, admin, or patient
  app.put(
    '/:id/status',
    { preHandler: [authenticate, authorize('doctor', 'admin', 'patient')] },
    (req: any, reply) => appointmentController.updateStatus(req, reply)
  );

  // All appointments for a patient
  app.get(
    '/patient/:patientId',
    { preHandler: [authenticate] },
    (req: any, reply) => appointmentController.getPatientAppointments(req, reply)
  );
}