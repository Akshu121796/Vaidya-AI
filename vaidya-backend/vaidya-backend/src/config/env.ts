import { z } from 'zod';
import dotenv from 'dotenv';

dotenv.config();

const envSchema = z.object({
  // Server
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.string().default('3000').transform(Number),
  HOST: z.string().default('0.0.0.0'),

  // JWT
  JWT_SECRET: z.string().min(32, 'JWT_SECRET must be at least 32 characters'),
  JWT_EXPIRES_IN: z.string().default('7d'),

  // Supabase
  SUPABASE_URL: z.string().url('SUPABASE_URL must be a valid URL'),
  SUPABASE_ANON_KEY: z.string().min(1, 'SUPABASE_ANON_KEY is required'),
  SUPABASE_SERVICE_KEY: z.string().min(1, 'SUPABASE_SERVICE_KEY is required'),

  // Redis
  REDIS_URL: z.string().min(1, 'REDIS_URL is required'),

  // Groq
  GROQ_API_KEY: z.string().min(1, 'GROQ_API_KEY is required'),

  // Telegram
  TELEGRAM_BOT_TOKEN: z.string().min(1, 'TELEGRAM_BOT_TOKEN is required'),
  ADMIN_TELEGRAM_CHAT_ID: z.string().optional(),
  // App Config
  CORS_ORIGIN: z.string().default('http://localhost:3001'),
  OUTBREAK_THRESHOLD: z.string().default('10').transform(Number),
  OUTBREAK_WINDOW_HOURS: z.string().default('48').transform(Number),
});

// Parse and validate. If this throws, the server won't start.
// That's intentional — a misconfigured server is worse than no server.
const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error('❌ Invalid environment variables:');
  console.error(parsed.error.flatten().fieldErrors);
  process.exit(1);
}

export const env = parsed.data;

// Export the type so other files get full TypeScript autocomplete
export type Env = typeof env;