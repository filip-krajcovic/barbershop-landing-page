import { randomUUID } from 'node:crypto';
import type { UserRole } from '@britva/shared';
import type { NestExpressApplication } from '@nestjs/platform-express';
import type { Pool } from 'pg';
import request from 'supertest';
import { PG_POOL } from '../src/database/database.constants.js';

export const ORIGIN = 'http://localhost:3000';

/** Prefix testovacích dát – `cleanupTestData` ich po testoch zmaže. */
export const TEST_PREFIX = 'e2e-';

export const uniqueSlug = (name: string) => `${TEST_PREFIX}${name}-${randomUUID().slice(0, 8)}`;

export const getPool = (app: NestExpressApplication) => app.get<Pool>(PG_POOL);

/** Cookie z odpovede better-auth vo formáte pre hlavičku `Cookie`. */
export function cookieFrom(res: request.Response): string[] {
  const raw = res.headers['set-cookie'] as unknown as string[] | undefined;
  if (!raw?.length) {
    throw new Error(`Odpoveď nemá set-cookie (status ${res.status}).`);
  }
  return raw.map((c) => c.split(';')[0]!);
}

/** Zaregistruje nového používateľa, nastaví mu rolu a vráti session cookie. */
export async function signInAs(app: NestExpressApplication, role: UserRole): Promise<string[]> {
  const email = `${TEST_PREFIX}${randomUUID()}@britva.test`;
  const password = 'testovacie-heslo-123';
  const http = request(app.getHttpServer());

  await request(app.getHttpServer())
    .post('/api/auth/sign-up/email')
    .set('Origin', ORIGIN)
    .send({ name: `Test ${role}`, email, password })
    .expect(200);
  await getPool(app).query(`UPDATE "user" SET role = $1 WHERE email = $2`, [role, email]);

  // Nové prihlásenie, aby session obsahovala aktuálnu rolu.
  const res = await http
    .post('/api/auth/sign-in/email')
    .set('Origin', ORIGIN)
    .send({ email, password })
    .expect(200);
  return cookieFrom(res);
}

/** Zmaže rezervácie, služby a barberov vytvorených testami (väzby sa zmažú kaskádou). */
export async function cleanupTestData(app: NestExpressApplication): Promise<void> {
  const pool = getPool(app);
  await pool.query(
    `DELETE FROM bookings WHERE service_id IN (SELECT id FROM services WHERE slug LIKE $1)
       OR barber_id IN (SELECT id FROM barbers WHERE slug LIKE $1)`,
    [`${TEST_PREFIX}%`],
  );
  await pool.query(`DELETE FROM barbers WHERE slug LIKE $1`, [`${TEST_PREFIX}%`]);
  await pool.query(`DELETE FROM services WHERE slug LIKE $1`, [`${TEST_PREFIX}%`]);
}
