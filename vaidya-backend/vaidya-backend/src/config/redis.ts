import Redis from 'ioredis';
import { env } from './env';

// Plain connection options — pass this to BullMQ queues and workers
// BullMQ creates its own ioredis connection from these options internally
export const redisConnectionOptions = {
  url: env.REDIS_URL,
  maxRetriesPerRequest: null, // required by BullMQ
  enableReadyCheck: false,    // required by BullMQ
} as const;

// Separate ioredis client for your own use (rate limiting, caching, etc.)
let redisClient: Redis | null = null;

export function getRedisClient(): Redis {
  if (!redisClient) {
    redisClient = new Redis(env.REDIS_URL, {
      maxRetriesPerRequest: null,
      lazyConnect: true,
      tls: env.NODE_ENV === 'production' ? {} : undefined,
    });

    redisClient.on('connect', () => {
      console.log('✅ Redis connected');
    });

    redisClient.on('error', (err) => {
      console.error('❌ Redis error:', err.message);
    });
  }
  return redisClient;
}

export const redis = getRedisClient();