import type { FastifyRequest, FastifyReply } from 'fastify';
import type { UserRole } from '../types/models';

export function authorize(...allowedRoles: UserRole[]) {
  // Returns a middleware function — this is the "factory" pattern
  // Usage: preHandler: [authenticate, authorize('admin', 'doctor')]
  return async (request: FastifyRequest, reply: FastifyReply): Promise<void> => {
    const userRole = request.user?.role;

    if (!userRole || !allowedRoles.includes(userRole)) {
      reply.status(403).send({
        success: false,
        error: {
          code: 'FORBIDDEN',
          message: `Access denied. Required roles: ${allowedRoles.join(', ')}`,
        },
      });
    }
  };
}