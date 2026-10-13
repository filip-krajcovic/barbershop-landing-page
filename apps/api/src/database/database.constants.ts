import type { NodePgDatabase } from 'drizzle-orm/node-postgres';
import type * as schema from './schema/index.js';

/** Injection token pre Drizzle klienta: `@Inject(DRIZZLE) private readonly db: DrizzleDb`. */
export const DRIZZLE = Symbol('DRIZZLE');

/** Injection token pre pg Pool (napr. pre health check alebo better-auth). */
export const PG_POOL = Symbol('PG_POOL');

export type DrizzleDb = NodePgDatabase<typeof schema>;
