import type { FastifyRequest, FastifyReply } from 'fastify';
import { authService } from '../services/auth.service';
import { registerSchema, loginSchema } from '../schemas/auth.schema';
import { successResponse } from '../utils/response';
import { ValidationError } from '../utils/errors';

export class AuthController {
  async register(request: FastifyRequest, reply: FastifyReply) {
    // Validate request body with Zod
    const parsed = registerSchema.safeParse(request.body);
    if (!parsed.success) {
      throw new ValidationError(
  parsed.error.issues.map((e) => e.message).join(', ')
);
    }

    const result = await authService.register(parsed.data);

    return reply.status(201).send(successResponse(result));
  }

  async login(request: FastifyRequest, reply: FastifyReply) {
    const parsed = loginSchema.safeParse(request.body);
    if (!parsed.success) {
      throw new ValidationError(
  parsed.error.issues.map((e) => e.message).join(', ')
);
    }

    const result = await authService.login(parsed.data);

    // Generate JWT here using Fastify's jwt plugin
    // The service returns the user, we sign the token in the controller
    const token = await reply.jwtSign({
      userId: result.user.user_id,
      role: result.user.role,
    });

    return reply.send(
      successResponse({
        user: result.user,
        token,
      })
    );
  }

  async me(request: FastifyRequest, reply: FastifyReply) {
    // request.user is populated by the authenticate middleware
    const user = await authService.getMe(request.user.userId);
    return reply.send(successResponse({ user }));
  }
}

export const authController = new AuthController();