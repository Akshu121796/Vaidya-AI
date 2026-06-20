import type { FastifyInstance } from 'fastify';
import { doctorController } from '../controllers/doctor.controller';
import { authenticate } from '../middleware/authenticate';
import { authorize } from '../middleware/authorize';

export async function doctorRoutes(app: FastifyInstance) {
  // Anyone logged in can list doctors
  app.get(
    '/',
    { preHandler: [authenticate] },
    (req, reply) => doctorController.listDoctors(req, reply)
  );

  // Get my own doctor profile
  app.get(
    '/me',
    { preHandler: [authenticate, authorize('doctor')] },
    (req, reply) => doctorController.getMyProfile(req, reply)
  );

  // Get doctor by ID — any authenticated user
  app.get(
    '/:id',
    { preHandler: [authenticate] },
    (req: any, reply) => doctorController.getDoctorById(req, reply)
  );

  // Toggle availability — doctor or admin only
  app.put(
    '/:id/availability',
    { preHandler: [authenticate, authorize('doctor', 'admin')] },
    (req: any, reply) => doctorController.updateAvailability(req, reply)
  );

  // Doctor's appointment list
  app.get(
    '/:id/appointments',
    { preHandler: [authenticate, authorize('doctor', 'admin')] },
    (req: any, reply) => doctorController.getDoctorAppointments(req, reply)
  );
}