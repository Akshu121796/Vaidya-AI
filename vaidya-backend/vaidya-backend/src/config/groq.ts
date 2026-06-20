import Groq from 'groq-sdk';
import { env } from './env.js';

// Singleton pattern — one client, reused across all requests
export const groqClient = new Groq({
  apiKey: env.GROQ_API_KEY,
});