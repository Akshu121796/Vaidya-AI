import type { FastifyInstance } from 'fastify';
import { authController } from '../controllers/auth.controller';
import { authenticate } from '../middleware/authenticate';

export async function authRoutes(app: FastifyInstance) {
  // Public routes — no auth needed
  app.post('/register', (req, reply) => authController.register(req, reply));
  app.post('/login', (req, reply) => authController.login(req, reply));

  // Protected route — must be logged in
  app.get(
    '/me',
    { preHandler: [authenticate] },
    (req, reply) => authController.me(req, reply)
  );
}