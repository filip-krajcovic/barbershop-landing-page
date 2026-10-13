/**
 * Ukážkové dáta podľa dizajnu: cenník, barberi a otváracie hodiny.
 * Spustenie: `pnpm db:seed`. Je idempotentný – opakované spustenie údaje aktualizuje, nič nezdvojí.
 */
import { sql } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from './schema/index.js';

const { barberServices, barbers, services, workingHours } = schema;

const SERVICES = [
  {
    slug: 'pansky-strih',
    name: 'Pánsky strih',
    durationMin: 45,
    priceCents: 2200,
    description: 'Konzultácia, umytie, strih nožnicami aj strojčekom, styling.',
  },
  {
    slug: 'strih-brada',
    name: 'Strih + brada',
    durationMin: 75,
    priceCents: 3400,
    description: 'Kompletný servis vlasov aj brady s horúcim uterákom.',
  },
  {
    slug: 'skin-fade',
    name: 'Skin fade',
    durationMin: 50,
    priceCents: 2500,
    description: 'Prechod až do kože, presné kontúry britvou.',
  },
  {
    slug: 'uprava-brady',
    name: 'Úprava brady',
    durationMin: 30,
    priceCents: 1500,
    description: 'Tvarovanie, kontúry britvou, olej a balzam.',
  },
  {
    slug: 'holenie-britvou',
    name: 'Holenie britvou',
    durationMin: 40,
    priceCents: 2000,
    description: 'Tradičné mokré holenie, horúci a studený uterák.',
  },
  {
    slug: 'detsky-strih',
    name: 'Detský strih',
    durationMin: 30,
    priceCents: 1500,
    description: 'Pre chalanov do 12 rokov, bez stresu.',
  },
];

const BARBERS = [
  { slug: 'marek', name: 'Marek', role: 'Majiteľ · fade a klasika' },
  { slug: 'tomas', name: 'Tomáš', role: 'Brady a holenie britvou' },
  { slug: 'david', name: 'Dávid', role: 'Textúry a dlhšie vlasy' },
];

/** 0 = nedeľa … 6 = sobota. Nedeľa je zatvorené. */
const HOURS: { weekday: number; opensAt: string; closesAt: string }[] = [
  ...[1, 2, 3, 4, 5].map((weekday) => ({ weekday, opensAt: '09:00', closesAt: '19:00' })),
  { weekday: 6, opensAt: '08:00', closesAt: '13:00' },
];

async function main(): Promise<void> {
  try {
    process.loadEnvFile('.env');
  } catch {
    // .env nie je povinný
  }
  if (process.env.NODE_ENV === 'production' && !process.argv.includes('--force')) {
    throw new Error('Seed v produkcii spusti iba vedome s parametrom --force.');
  }
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error('Chýba DATABASE_URL.');
  }

  const pool = new Pool({ connectionString });
  const db = drizzle({ client: pool, schema, casing: 'snake_case' });

  try {
    await db.transaction(async (tx) => {
      const serviceRows = await tx
        .insert(services)
        .values(SERVICES.map((s, i) => ({ ...s, sortOrder: i })))
        .onConflictDoUpdate({
          target: services.slug,
          set: {
            name: sql`excluded.name`,
            description: sql`excluded.description`,
            durationMin: sql`excluded.duration_min`,
            priceCents: sql`excluded.price_cents`,
            sortOrder: sql`excluded.sort_order`,
          },
        })
        .returning({ id: services.id });

      const barberRows = await tx
        .insert(barbers)
        .values(BARBERS.map((b, i) => ({ ...b, sortOrder: i })))
        .onConflictDoUpdate({
          target: barbers.slug,
          set: {
            name: sql`excluded.name`,
            role: sql`excluded.role`,
            sortOrder: sql`excluded.sort_order`,
          },
        })
        .returning({ id: barbers.id });

      await tx
        .insert(barberServices)
        .values(
          barberRows.flatMap((b) => serviceRows.map((s) => ({ barberId: b.id, serviceId: s.id }))),
        )
        .onConflictDoNothing();

      await tx
        .insert(workingHours)
        .values(barberRows.flatMap((b) => HOURS.map((h) => ({ ...h, barberId: b.id }))))
        .onConflictDoUpdate({
          target: [workingHours.barberId, workingHours.weekday],
          set: { opensAt: sql`excluded.opens_at`, closesAt: sql`excluded.closes_at` },
        });

      console.log(
        `Seed hotový: ${serviceRows.length} služieb, ${barberRows.length} barberi, ${barberRows.length * HOURS.length} záznamov otváracích hodín.`,
      );
    });
  } finally {
    await pool.end();
  }
}

main().catch((error: unknown) => {
  console.error(error);
  process.exitCode = 1;
});
