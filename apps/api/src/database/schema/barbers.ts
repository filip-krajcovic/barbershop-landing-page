import { boolean, integer, pgTable, primaryKey, text, uuid, varchar } from 'drizzle-orm/pg-core';
import { id, timestamps } from './columns.js';
import { services } from './services.js';

export const barbers = pgTable('barbers', {
  id: id(),
  slug: varchar({ length: 64 }).notNull().unique(),
  name: varchar({ length: 100 }).notNull(),
  role: varchar({ length: 200 }).notNull().default(''),
  avatarUrl: text(),
  sortOrder: integer().notNull().default(0),
  active: boolean().notNull().default(true),
  ...timestamps,
});

/** Ktoré služby robí ktorý barber (M:N). */
export const barberServices = pgTable(
  'barber_services',
  {
    barberId: uuid()
      .notNull()
      .references(() => barbers.id, { onDelete: 'cascade' }),
    serviceId: uuid()
      .notNull()
      .references(() => services.id, { onDelete: 'cascade' }),
  },
  (t) => [primaryKey({ columns: [t.barberId, t.serviceId] })],
);
