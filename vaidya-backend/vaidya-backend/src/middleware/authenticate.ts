import type { FastifyRequest, FastifyReply } from 'fastify';
import { UnauthorizedError } from '../utils/errors';

export async function authenticate(
  request: FastifyRequest,
  reply: FastifyReply
): Promise<void> {
  try {
    // This verifies the JWT signature and expiry automatically
    // It also attaches the decoded payload to request.user
    await request.jwtVerify();
  } catch {
    const error = new UnauthorizedError('Invalid or expired token');
    reply.status(401).send({
      success: false,
      error: { code: error.code, message: error.message },
    });
  }
}