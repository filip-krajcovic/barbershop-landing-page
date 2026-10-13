import { sql } from 'drizzle-orm';
import { check, index, pgTable, smallint, text, time, unique, uuid } from 'drizzle-orm/pg-core';
import { barbers } from './barbers.js';
import { id, timestamptz, timestamps } from './columns.js';

/**
 * Pravidelné otváracie hodiny barbera.
 * `weekday` je 0 = nedeľa … 6 = sobota (ako Date#getDay), časy sú v miestnom čase prevádzky.
 */
export const workingHours = pgTable(
  'working_hours',
  {
    id: id(),
    barberId: uuid()
      .notNull()
      .references(() => barbers.id, { onDelete: 'cascade' }),
    weekday: smallint().notNull(),
    opensAt: time().notNull(),
    closesAt: time().notNull(),
    ...timestamps,
  },
  (t) => [
    unique('working_hours_barber_weekday_unique').on(t.barberId, t.weekday),
    check('working_hours_weekday_range', sql`${t.weekday} BETWEEN 0 AND 6`),
    check('working_hours_closes_after_opens', sql`${t.closesAt} > ${t.opensAt}`),
  ],
);

/** Výnimky – dovolenka, lekár, sviatok. Barber je v tomto intervale nedostupný. */
export const timeOff = pgTable(
  'time_off',
  {
    id: id(),
    barberId: uuid()
      .notNull()
      .references(() => barbers.id, { onDelete: 'cascade' }),
    startsAt: timestamptz().notNull(),
    endsAt: timestamptz().notNull(),
    reason: text(),
    ...timestamps,
  },
  (t) => [
    index('time_off_barber_starts_idx').on(t.barberId, t.startsAt),
    check('time_off_ends_after_starts', sql`${t.endsAt} > ${t.startsAt}`),
  ],
);
