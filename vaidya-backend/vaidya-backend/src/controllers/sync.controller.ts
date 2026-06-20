import type { FastifyRequest, FastifyReply } from 'fastify';
import { syncService } from '../services/sync.service';
import { syncBatchSchema } from '../schemas/sync.schema';
import { successResponse } from '../utils/response';
import { ValidationError } from '../utils/errors';

export class SyncController {
  async processBatch(request: FastifyRequest, reply: FastifyReply) {
    const parsed = syncBatchSchema.safeParse(request.body);
    if (!parsed.success) {
      throw new ValidationError(
        parsed.error.issues.map((e) => e.message).join(', ')
      );
    }

    const result = await syncService.processBatch(
      parsed.data,
      request.user.userId
    );

    return reply.status(200).send(successResponse({ sync: result }));
  }
}

export const syncController = new SyncController();