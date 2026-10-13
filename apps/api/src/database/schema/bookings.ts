import { sql } from 'drizzle-orm';
import { check, index, pgEnum, pgTable, text, uuid, varchar } from 'drizzle-orm/pg-core';
import { barbers } from './barbers.js';
import { timestamptz, id, timestamps } from './columns.js';
import { services } from './services.js';

export const bookingStatus = pgEnum('booking_status', [
  'pending',
  'confirmed',
  'cancelled',
  'completed',
]);

/**
 * Rezervácie. Prekrývanie aktívnych termínov jedného barbera blokuje
 * exclusion constraint `bookings_no_overlap` (vlastná migrácia, btree_gist).
 */
export const bookings = pgTable(
  'bookings',
  {
    id: id(),
    code: varchar({ length: 16 }).notNull().unique(),
    /** ID používateľa z better-auth; null pre rezerváciu bez účtu. FK pribudne s tabuľkou user. */
    userId: text(),
    serviceId: uuid()
      .notNull()
      .references(() => services.id, { onDelete: 'restrict' }),
    barberId: uuid()
      .notNull()
      .references(() => barbers.id, { onDelete: 'restrict' }),
    startsAt: timestamptz().notNull(),
    endsAt: timestamptz().notNull(),
    customerName: varchar({ length: 100 }).notNull(),
    phone: varchar({ length: 20 }).notNull(),
    note: text(),
    status: bookingStatus().notNull().default('confirmed'),
    cancelledAt: timestamptz(),
    ...timestamps,
  },
  (t) => [
    index('bookings_barber_starts_idx').on(t.barberId, t.startsAt),
    index('bookings_user_idx').on(t.userId),
    check('bookings_ends_after_starts', sql`${t.endsAt} > ${t.startsAt}`),
  ],
);
