import { boolean, index, pgTable, text } from 'drizzle-orm/pg-core';
import { timestamptz, timestamps } from './columns.js';

/**
 * Tabuľky better-auth (user, session, account, verification).
 * Polia zodpovedajú `getAuthTables()` z better-auth 1.7 pre našu konfiguráciu
 * (email + heslo, dodatočné polia `role` a `phone`). ID generuje better-auth (text).
 */
export const user = pgTable('user', {
  id: text().primaryKey(),
  name: text().notNull(),
  email: text().notNull().unique(),
  emailVerified: boolean().notNull().default(false),
  image: text(),
  /** `customer` | `admin` – nastavuje sa iba na serveri, nie pri registrácii. */
  role: text().notNull().default('customer'),
  phone: text(),
  ...timestamps,
});

export const session = pgTable(
  'session',
  {
    id: text().primaryKey(),
    expiresAt: timestamptz().notNull(),
    token: text().notNull().unique(),
    ipAddress: text(),
    userAgent: text(),
    userId: text()
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),
    ...timestamps,
  },
  (t) => [index('session_user_idx').on(t.userId)],
);

export const account = pgTable(
  'account',
  {
    id: text().primaryKey(),
    accountId: text().notNull(),
    providerId: text().notNull(),
    userId: text()
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),
    accessToken: text(),
    refreshToken: text(),
    idToken: text(),
    accessTokenExpiresAt: timestamptz(),
    refreshTokenExpiresAt: timestamptz(),
    scope: text(),
    /** Hash hesla (better-auth, scrypt). */
    password: text(),
    ...timestamps,
  },
  (t) => [index('account_user_idx').on(t.userId)],
);

export const verification = pgTable(
  'verification',
  {
    id: text().primaryKey(),
    identifier: text().notNull(),
    value: text().notNull(),
    expiresAt: timestamptz().notNull(),
    ...timestamps,
  },
  (t) => [index('verification_identifier_idx').on(t.identifier)],
);
