import { timestamp, uuid } from 'drizzle-orm/pg-core';

/** Primárny kľúč – UUID v4 generovaný databázou. */
export const id = () => uuid().primaryKey().defaultRandom();

/** Časová pečiatka s časovou zónou (timestamptz), v TS ako Date. */
export const timestamptz = () => timestamp({ withTimezone: true, mode: 'date' });

export const timestamps = {
  createdAt: timestamptz().notNull().defaultNow(),
  updatedAt: timestamptz()
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
};
