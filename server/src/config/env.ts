import { z } from 'zod';

const envSchema = z.object({
    NODE_ENV: z.string().default('development'),
    PORT: z.string().default('5000'),
    DATABASE_URL: z.string(),
    JWT_SECRET: z.string().min(32),
    REFRESH_TOKEN_SECRET: z.string().min(32),
    JWT_EXPIRES_IN: z.string().default('24h'),
    REFRESH_TOKEN_EXPIRES_IN: z.string().default('7d'),
    CORS_ORIGIN: z.string().default('http://localhost:3000'),
    RATE_LIMIT_WINDOW_MS: z.string().default('900000'),
    RATE_LIMIT_MAX_REQUESTS: z.string().default('100'),
});

export const env = envSchema.parse(process.env);
