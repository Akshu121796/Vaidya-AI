import type { FastifyInstance } from 'fastify';
import { triageController } from '../controllers/triage.controller';
import { authenticate } from '../middleware/authenticate';

export async function triageRoutes(app: FastifyInstance) {
  // Text triage — any authenticated user
  app.post(
    '/text',
    { preHandler: [authenticate] },
    (req, reply) => triageController.triageText(req, reply)
  );

  // Voice triage — any authenticated user
  app.post(
    '/voice',
    { preHandler: [authenticate] },
    (req, reply) => triageController.triageVoice(req, reply)
  );

  // Get past report — any authenticated user
  app.get(
    '/report/:id',
    { preHandler: [authenticate] },
    (req: any, reply) => triageController.getReport(req, reply)
  );
}