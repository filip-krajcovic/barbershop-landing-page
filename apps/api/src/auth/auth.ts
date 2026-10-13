import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import type { Env } from '../config/env.validation.js';
import type { DrizzleDb } from '../database/database.constants.js';
import { account, session, user, verification } from '../database/schema/index.js';

/** Injection token pre inštanciu better-auth. */
export const AUTH = Symbol('AUTH');

export const AUTH_BASE_PATH = '/api/auth';

type AuthEnv = Pick<Env, 'BETTER_AUTH_SECRET' | 'BETTER_AUTH_URL' | 'WEB_URL'>;

export function createAuth(db: DrizzleDb, env: AuthEnv) {
  return betterAuth({
    appName: 'Britva Barber',
    baseURL: env.BETTER_AUTH_URL,
    basePath: AUTH_BASE_PATH,
    secret: env.BETTER_AUTH_SECRET,
    trustedOrigins: [env.WEB_URL],
    database: drizzleAdapter(db, {
      provider: 'pg',
      schema: { user, session, account, verification },
    }),
    emailAndPassword: {
      enabled: true,
      minPasswordLength: 8,
      maxPasswordLength: 128,
      autoSignIn: true,
    },
    user: {
      additionalFields: {
        // input: false – rolu si používateľ nemôže nastaviť pri registrácii ani úprave profilu
        role: { type: 'string', defaultValue: 'customer', input: false },
        phone: { type: 'string', required: false },
      },
    },
    session: {
      expiresIn: 60 * 60 * 24 * 30, // 30 dní
      updateAge: 60 * 60 * 24, // predĺženie najviac raz denne
    },
  });
}

export type Auth = ReturnType<typeof createAuth>;
export type AuthSession = NonNullable<Awaited<ReturnType<Auth['api']['getSession']>>>;
export type AuthUser = AuthSession['user'];
