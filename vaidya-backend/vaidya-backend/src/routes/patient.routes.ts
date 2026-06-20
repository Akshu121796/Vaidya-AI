import type { FastifyInstance } from 'fastify';
import { patientController } from '../controllers/patient.controller';
import { authenticate } from '../middleware/authenticate';
import { authorize } from '../middleware/authorize';

export async function patientRoutes(app: FastifyInstance) {
  // ASHA or admin registers a patient
  app.post(
    '/register',
    { preHandler: [authenticate, authorize('asha', 'admin')] },
    (req, reply) => patientController.registerByAsha(req, reply)
  );

  // Get my own profile (patient logs in and views their profile)
  app.get(
    '/me',
    { preHandler: [authenticate] },
    (req, reply) => patientController.getMyProfile(req, reply)
  );

  // QR scan — public endpoint, token is the auth
  // Doctor scans QR card, no JWT needed
  app.get(
    '/qr/:token',
    (req: any, reply) => patientController.getPatientByQrToken(req, reply)
  );

  // Get patient by ID
  app.get(
    '/:id',
    { preHandler: [authenticate] },
    (req: any, reply) => patientController.getPatientById(req, reply)
  );

  // Update patient profile
  app.put(
    '/:id',
    { preHandler: [authenticate] },
    (req: any, reply) => patientController.updatePatient(req, reply)
  );

  // Full medical history
  app.get(
    '/:id/history',
    { preHandler: [authenticate] },
    (req: any, reply) => patientController.getPatientHistory(req, reply)
  );
}