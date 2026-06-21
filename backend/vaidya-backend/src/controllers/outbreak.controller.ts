import type { FastifyRequest, FastifyReply } from 'fastify';
import { outbreakService } from '../services/outbreak.service';
import { successResponse } from '../utils/response';

export class OutbreakController {
  async getAlerts(_request: FastifyRequest, reply: FastifyReply) {
    const alerts = await outbreakService.getActiveAlerts();
    return reply.send(successResponse({ alerts }));
  }

  async getHeatmap(_request: FastifyRequest, reply: FastifyReply) {
    const heatmap = await outbreakService.getHeatmap();
    return reply.send(successResponse({ heatmap }));
  }

  // Manual trigger — admin only, perfect for demo
  async triggerDetection(_request: FastifyRequest, reply: FastifyReply) {
    const result = await outbreakService.runDetection();
    return reply.send(successResponse({ result }));
  }
}

export const outbreakController = new OutbreakController();