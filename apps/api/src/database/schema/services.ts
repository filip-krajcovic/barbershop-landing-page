import { sql } from 'drizzle-orm';
import { boolean, check, integer, pgTable, text, varchar } from 'drizzle-orm/pg-core';
import { id, timestamps } from './columns.js';

/** Služby z cenníka (strih, brada, ...). Cena v centoch. */
export const services = pgTable(
  'services',
  {
    id: id(),
    slug: varchar({ length: 64 }).notNull().unique(),
    name: varchar({ length: 100 }).notNull(),
    description: text().notNull().default(''),
    durationMin: integer().notNull(),
    priceCents: integer().notNull(),
    sortOrder: integer().notNull().default(0),
    active: boolean().notNull().default(true),
    ...timestamps,
  },
  (t) => [
    check('services_duration_positive', sql`${t.durationMin} > 0`),
    check('services_price_non_negative', sql`${t.priceCents} >= 0`),
  ],
);
