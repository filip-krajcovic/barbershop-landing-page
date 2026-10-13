import { pgErrorCode, PG_UNIQUE_VIOLATION } from './database-errors.js';

describe('pgErrorCode', () => {
  it('nájde kód priamo aj v zabalenej príčine', () => {
    expect(pgErrorCode({ code: PG_UNIQUE_VIOLATION })).toBe(PG_UNIQUE_VIOLATION);
    expect(pgErrorCode(new Error('drizzle', { cause: { code: '23503' } }))).toBe('23503');
  });

  it('vráti undefined pre chybu bez kódu', () => {
    expect(pgErrorCode(new Error('x'))).toBeUndefined();
    expect(pgErrorCode(null)).toBeUndefined();
  });
});
