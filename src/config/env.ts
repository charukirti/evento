import { z } from 'zod';

const envSchema = z.object({
  DATABASE_URL: z.string().min(1, 'DATABASE_URL is required'),
  JWT_ACCESS_SECRET: z.string().min(1, 'JWT_ACCESS_SECRET is required'),
  JWT_REFRESH_SECRET: z.string().min(1, 'JWT_REFRESH_SECRET is required'),
  PORT: z.coerce.number().int().positive().default(3000),
  NODE_ENV: z
    .enum(['development', 'production', 'test'])
    .default('development'),
  JWT_REFRESH_TOKEN_EXPIRY: z.string().default('7d'),
  JWT_ACCESS_TOKEN_EXPIRY: z.string().default('15m'),
});

const parsedEnv = envSchema.safeParse({
  DATABASE_URL: Bun.env.DATABASE_URL,
  JWT_ACCESS_SECRET: Bun.env.JWT_ACCESS_SECRET,
  JWT_REFRESH_SECRET: Bun.env.JWT_REFRESH_SECRET,
  PORT: Bun.env.PORT,
  NODE_ENV: Bun.env.NODE_ENV,
  JWT_ACCESS_TOKEN_EXPIRY: Bun.env.JWT_ACCESS_TOKEN_EXPIRY,
  JWT_REFRESH_TOKEN_EXPIRY: Bun.env.JWT_REFRESH_TOKEN_EXPIRY,
});

if (!parsedEnv.success) {
  const issues = parsedEnv.error.issues
    .map((issue) => `${issue.path.join('.') || 'root'}: ${issue.message}`)
    .join('\n');

  throw new Error(`Environment validation failed:\n${issues}`);
}

export const env = parsedEnv.data;
