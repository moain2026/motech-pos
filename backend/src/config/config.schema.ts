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
  // ERP master schema that owns the canonical item/customer master
  // (IAS_ITM_MST.I_NAME etc.). Imported locally 2026-06-29; MOTECH_RO has
  // SELECT on it. Read-only, schema-qualified joins.
  ORACLE_MASTER_SCHEMA: z.string().min(1).default('IAS202623'),
  ORACLE_POOL_MIN: z.coerce.number().int().min(0).default(1),
  ORACLE_POOL_MAX: z.coerce.number().int().min(1).default(4),
  ORACLE_POOL_TIMEOUT: z.coerce.number().int().min(0).default(60),

  // --- Oracle WRITE side (our own schema MOTECH_POS, separate from YSPOS23) ---
  // The new system READS reference data from YSPOS23 (MOTECH_RO) but WRITES its
  // own bills/payments/shifts into this schema. Distinct least-privilege user.
  ORACLE_WRITE_USER: z.string().min(1).default('MOTECH_POS'),
  ORACLE_WRITE_PASSWORD: z.string().min(1),
  ORACLE_WRITE_SCHEMA: z.string().min(1).default('MOTECH_POS'),
  // Real Onyx POS schema that receives the actual bills (IAS_POS_BILL_MST/DTL).
  // The write user (MOTECH_RW) has INSERT/UPDATE on those two tables only.
  ORACLE_ONYX_SCHEMA: z.string().min(1).default('YSPOS23'),

  // --- Auth / JWT (STANDARDS/07 §A02, §A07) ---
  // Secret MUST be provided via env; ≥32 chars AND not a known dev/template
  // value (the API is public — a guessable secret = full token forgery).
  JWT_SECRET: z
    .string()
    .min(32, 'JWT_SECRET must be at least 32 characters')
    .refine(
      (s) =>
        !/^(dev-local-secret|change-me|changeme|secret|test)/i.test(s),
      'JWT_SECRET must not be a dev/template placeholder — generate one: openssl rand -base64 48',
    ),
  JWT_ACCESS_TTL: z.string().default('15m'),
  JWT_REFRESH_TTL: z.string().default('7d'),
  JWT_ISSUER: z.string().default('motech-pos'),
  // Path to the local (temporary) users seed file (see auth module docs).
  AUTH_USERS_FILE: z.string().default('auth-users.json'),
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
