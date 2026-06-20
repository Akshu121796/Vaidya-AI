import type { FastifyInstance } from 'fastify';
import { telegramController } from '../controllers/telegram.controller';

export async function telegramRoutes(app: FastifyInstance) {
  // Public endpoint for Telegram webhook callbacks
  app.post('/webhook', (req, reply) =>
    telegramController.handleWebhook(req, reply)
  );
}
