import type { FastifyInstance } from 'fastify';
import { medicineController } from '../controllers/medicine.controller';
import { authenticate } from '../middleware/authenticate';
import { authorize } from '../middleware/authorize';

export async function medicineRoutes(app: FastifyInstance) {
  // Search medicines — any authenticated user
  app.get(
    '/search',
    { preHandler: [authenticate] },
    (req, reply) => medicineController.searchMedicines(req, reply)
  );

  // Get all medicines in a pharmacy — any authenticated user
  app.get(
    '/pharmacy/:id',
    { preHandler: [authenticate] },
    (req: any, reply) => medicineController.getPharmacyMedicines(req, reply)
  );

  // Add medicine — pharmacy only
  app.post(
    '/',
    { preHandler: [authenticate, authorize('pharmacy')] },
    (req, reply) => medicineController.addMedicine(req, reply)
  );

  // Update stock/price — pharmacy only
  app.put(
    '/:id',
    { preHandler: [authenticate, authorize('pharmacy')] },
    (req: any, reply) => medicineController.updateMedicine(req, reply)
  );
}