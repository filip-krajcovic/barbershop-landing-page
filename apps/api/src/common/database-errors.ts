/** Kódy chýb PostgreSQL, na ktoré reagujeme. */
export const PG_UNIQUE_VIOLATION = '23505';
export const PG_FOREIGN_KEY_VIOLATION = '23503';
export const PG_EXCLUSION_VIOLATION = '23P01';

/**
 * Kód chyby PostgreSQL z výnimky. Drizzle zabaľuje chybu ovládača do `cause`,
 * preto prechádzame reťaz príčin.
 */
export function pgErrorCode(error: unknown): string | undefined {
  let current: unknown = error;
  for (let depth = 0; depth < 5 && current; depth++) {
    if (typeof current === 'object' && 'code' in current && typeof current.code === 'string') {
      return current.code;
    }
    current = (current as { cause?: unknown }).cause;
  }
  return undefined;
}
