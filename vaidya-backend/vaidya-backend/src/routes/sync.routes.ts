import type { FastifyInstance } from 'fastify';
import { syncController } from '../controllers/sync.controller';
import { authenticate } from '../middleware/authenticate';
import { authorize } from '../middleware/authorize';

export async function syncRoutes(app: FastifyInstance) {
  // Only ASHA workers and admins can submit batch sync
  app.post(
    '/batch',
    { preHandler: [authenticate, authorize('asha', 'admin')] },
    (req, reply) => syncController.processBatch(req, reply)
  );
}