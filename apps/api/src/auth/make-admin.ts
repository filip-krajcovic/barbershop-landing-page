/**
 * Nastaví existujúcemu používateľovi rolu admin (registráciou sa admin vytvoriť nedá).
 * Spustenie: `pnpm --filter @britva/api auth:make-admin jan@example.sk`
 */
import { eq } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import { user } from '../database/schema/index.js';

async function main(): Promise<void> {
  try {
    process.loadEnvFile('.env');
  } catch {
    // .env nie je povinný
  }
  const email = process.argv[2]?.trim().toLowerCase();
  if (!email) {
    throw new Error('Použitie: auth:make-admin <email>');
  }
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  try {
    const db = drizzle({ client: pool, casing: 'snake_case' });
    const updated = await db
      .update(user)
      .set({ role: 'admin' })
      .where(eq(user.email, email))
      .returning({ id: user.id });
    if (updated.length === 0) {
      throw new Error(`Používateľ ${email} neexistuje – najprv sa musí zaregistrovať.`);
    }
    console.log(`${email} je teraz admin.`);
  } finally {
    await pool.end();
  }
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
