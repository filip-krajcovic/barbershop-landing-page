import { z } from 'zod';

export const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().int().min(1).max(65535).default(3001),
  WEB_URL: z.url(),
  DATABASE_URL: z.url({ protocol: /^postgres(ql)?$/ }),
  BETTER_AUTH_SECRET: z.string().min(32),
  BETTER_AUTH_URL: z.url(),
  /**
   * Tajný kľúč zdieľaný so serverom webu (web `NUXT_API_PROXY_SECRET`). Ak je nastavený, API
   * prijme iba requesty z webu a pre rate limit verí IP návštevníka, ktorú web pošle.
   */
  PROXY_SECRET: z.preprocess((v) => (v === '' ? undefined : v), z.string().min(32).optional()),
  /** Max. počet rezervácií z jednej IP adresy za minútu. */
  BOOKING_RATE_LIMIT: z.coerce.number().int().positive().default(10),
});

export type Env = z.infer<typeof envSchema>;

/**
 * Validácia premenných prostredia pre ConfigModule.
 * Pri chybe aplikácia nenaštartuje a vypíše, ktoré premenné sú neplatné.
 */
export function validateEnv(config: Record<string, unknown>): Env {
  const result = envSchema.safeParse(config);
  if (!result.success) {
    const details = result.error.issues
      .map((issue) => `  - ${issue.path.join('.')}: ${issue.message}`)
      .join('\n');
    throw new Error(`Neplatná konfigurácia prostredia:\n${details}`);
  }
  return result.data;
}
