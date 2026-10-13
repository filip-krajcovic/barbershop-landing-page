import { describe, expect, it } from 'vitest';
import { apiErrorMessage, apiErrorStatus } from '~/utils/api-error';
import { formatPrice } from '~/utils/format';

describe('formatPrice', () => {
  it('celé eurá bez desatinných miest, inak dve desatinné miesta', () => {
    expect(formatPrice(2200)).toBe('22 €');
    expect(formatPrice(2250)).toBe('22,50 €');
    expect(formatPrice(105)).toBe('1,05 €');
    expect(formatPrice(0)).toBe('0 €');
  });
});

describe('apiErrorMessage', () => {
  it('vráti správu z API alebo fallback', () => {
    expect(apiErrorMessage({ data: { message: 'Termín už nie je voľný.' } })).toBe(
      'Termín už nie je voľný.',
    );
    expect(apiErrorMessage(new Error('network'))).toMatch(/Nastala chyba/);
    expect(apiErrorMessage(null, 'X')).toBe('X');
    expect(apiErrorStatus({ statusCode: 409 })).toBe(409);
    expect(apiErrorStatus(new Error('x'))).toBeUndefined();
  });
});
