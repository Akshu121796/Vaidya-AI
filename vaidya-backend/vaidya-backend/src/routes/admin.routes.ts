import type { FastifyInstance } from 'fastify';
import { adminController } from '../controllers/admin.controller';
import { authenticate } from '../middleware/authenticate';
import { authorize } from '../middleware/authorize';

export async function adminRoutes(app: FastifyInstance) {
  app.addHook('preHandler', authenticate);
  app.addHook('preHandler', authorize('admin'));

  app.get('/stats',
    (req, reply) => adminController.getStats(req, reply));

  app.get('/villages',
    (req, reply) => adminController.getVillages(req, reply));

  app.get('/doctors/utilization',
    (req, reply) => adminController.getDoctorUtilization(req, reply));

  // ADD THIS
  app.get('/trends',
    (req: any, reply) => adminController.getDiseaseTrends(req, reply));
}