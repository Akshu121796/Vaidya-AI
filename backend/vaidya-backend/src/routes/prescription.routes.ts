import type { FastifyInstance } from 'fastify';
import { prescriptionController } from '../controllers/prescription.controller';
import { authenticate } from '../middleware/authenticate';
import { authorize } from '../middleware/authorize';

export async function prescriptionRoutes(app: FastifyInstance) {
  // Create prescription — doctor or admin only
  app.post(
    '/',
    { preHandler: [authenticate, authorize('doctor', 'admin')] },
    (req, reply) => prescriptionController.createPrescription(req, reply)
  );

  // Get specific prescription detail — all authenticated users (role checked in service)
  app.get(
    '/:id',
    { preHandler: [authenticate] },
    (req: any, reply) => prescriptionController.getPrescriptionById(req, reply)
  );

  // Get prescriptions by patient ID — all authenticated users (role checked in service)
  app.get(
    '/patient/:id',
    { preHandler: [authenticate] },
    (req: any, reply) => prescriptionController.getPrescriptionsByPatientId(req, reply)
  );

  // Dispense prescription — pharmacy or admin
  app.put(
    '/:id/dispense',
    { preHandler: [authenticate, authorize('pharmacy', 'admin')] },
    (req: any, reply) => prescriptionController.dispensePrescription(req, reply)
  );
}
