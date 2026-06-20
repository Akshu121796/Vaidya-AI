import Fastify from 'fastify';
import { startNotificationWorker } from './src/jobs/workers/notification.worker';
import type { FastifyError } from 'fastify';
import cors from '@fastify/cors';
import helmet from '@fastify/helmet';
import jwt from '@fastify/jwt';
import multipart from '@fastify/multipart';
import { registerRoutes } from './src/routes/index';
import { env } from './src/config/env';
import { logger } from './src/utils/logger';
import { AppError } from './src/utils/errors';
import { errorResponse } from './src/utils/response';

async function buildServer() {
  const app = Fastify({
    logger: false, // We use our own pino logger
    trustProxy: true,
  });

  // ─── Security Plugins ──────────────────────────────────────────
  await app.register(helmet, {
    contentSecurityPolicy: false, // Let Next.js handle CSP
  });

  await app.register(cors, {
    origin: env.CORS_ORIGIN,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  });

  // ─── JWT ───────────────────────────────────────────────────────
  await app.register(jwt, {
    secret: env.JWT_SECRET,
    sign: { expiresIn: env.JWT_EXPIRES_IN },
  });

  // ─── File Upload (for voice triage) ───────────────────────────
  await app.register(multipart, {
    limits: {
      fileSize: 10 * 1024 * 1024, // 10MB max for voice files
    },
  });

  // ─── Global Error Handler ──────────────────────────────────────
  // This catches every unhandled error in every route.
 app.setErrorHandler((error: FastifyError, _request, reply) => {
  logger.error({ err: error }, 'Unhandled error');

  if (error instanceof AppError) {
    return reply
      .status(error.statusCode)
      .send(errorResponse(error.code, error.message));
  }

  if (error.validation) {
    return reply
      .status(400)
      .send(errorResponse('VALIDATION_ERROR', error.message));
  }

  if (error.code === 'FST_JWT_AUTHORIZATION_TOKEN_INVALID') {
    return reply
      .status(401)
      .send(errorResponse('UNAUTHORIZED', 'Invalid or expired token'));
  }

  const message =
    env.NODE_ENV === 'development'
      ? error.message ?? 'Unknown error'
      : 'Internal server error';

  return reply.status(500).send(errorResponse('INTERNAL_ERROR', message));
});
  // ─── Health Check ──────────────────────────────────────────────
  app.get('/health', async () => ({
    status: 'ok',
    timestamp: new Date().toISOString(),
    environment: env.NODE_ENV,
  }));

  // ─── Routes (we'll wire these in as we build each module) ──────
  await app.register(registerRoutes, { prefix: '/api' });

  return app;
}

// ─── Start Server ────────────────────────────────────────────────
async function main() {
  try {
    const app = await buildServer();

    if (env.NODE_ENV !== 'production') {
      startNotificationWorker();
    }
    
    const address = await app.listen({
      port: env.PORT,
      host: env.HOST,
    });
    logger.info(`🚀 VAIDYA.AI Backend running at ${address}`);
    logger.info(`📋 Health check: ${address}/health`);
  } catch (err) {
    logger.error(err, 'Failed to start server');
    process.exit(1);
  }
}

main();
