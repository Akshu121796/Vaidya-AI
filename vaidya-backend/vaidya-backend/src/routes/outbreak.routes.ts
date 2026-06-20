import type { FastifyInstance } from 'fastify';
import { outbreakController } from '../controllers/outbreak.controller';
import { authenticate } from '../middleware/authenticate';
import { authorize } from '../middleware/authorize';

export async function outbreakRoutes(app: FastifyInstance) {
  // Active alerts — admin only
  app.get(
    '/alerts',
    { preHandler: [authenticate, authorize('admin')] },
    (req, reply) => outbreakController.getAlerts(req, reply)
  );

  // Heatmap data — any authenticated user (frontend map)
  app.get(
    '/heatmap',
    { preHandler: [authenticate] },
    (req, reply) => outbreakController.getHeatmap(req, reply)
  );

  // Manual trigger — admin only, for demo
  app.post(
    '/trigger',
    { preHandler: [authenticate, authorize('admin')] },
    (req, reply) => outbreakController.triggerDetection(req, reply)
  );
}