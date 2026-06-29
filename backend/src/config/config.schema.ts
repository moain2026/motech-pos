import { z } from 'zod';

/**
 * Environment validation schema (Zod) — fails fast at bootstrap (STANDARDS/03 §8, 14).
 * Numeric env vars arrive as strings; coerce explicitly.
 */
export const configSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().int().positive().default(3000),
  API_PREFIX: z.string().default('api/v1'),
  CORS_ORIGINS: z.string().default('http://localhost:5173'),

  LOG_LEVEL: z.enum(['fatal', 'error', 'warn', 'info', 'debug', 'trace']).default('info'),

  ORACLE_USER: z.string().min(1),
  ORACLE_PASSWORD: z.string().min(1),
  ORACLE_CONNECT_STRING: z.string().min(1),
  ORACLE_SCHEMA: z.string().min(1).default('YSPOS23'),
  ORACLE_POOL_MIN: z.coerce.number().int().min(0).default(1),
  ORACLE_POOL_MAX: z.coerce.number().int().min(1).default(4),
  ORACLE_POOL_TIMEOUT: z.coerce.number().int().min(0).default(60),
});

export type AppConfig = z.infer<typeof configSchema>;

/** Validates raw env and returns a typed, frozen config. Throws on invalid env. */
export function validateConfig(raw: Record<string, unknown>): AppConfig {
  const parsed = configSchema.safeParse(raw);
  if (!parsed.success) {
    const issues = parsed.error.issues
      .map((i) => `  - ${i.path.join('.') || '(root)'}: ${i.message}`)
      .join('\n');
    throw new Error(`Invalid environment configuration:\n${issues}`);
  }
  return Object.freeze(parsed.data);
}

/** Parsed CORS origins as an array (comma-separated). */
export function corsOrigins(cfg: AppConfig): string[] {
  return cfg.CORS_ORIGINS.split(',')
    .map((s) => s.trim())
    .filter(Boolean);
}
