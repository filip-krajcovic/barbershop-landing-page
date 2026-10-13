import { describe, expect, it } from 'vitest';
import { authErrorMessage, safeRedirect } from '~/utils/auth-client';

describe('safeRedirect', () => {
  it('povolí iba interné cesty', () => {
    expect(safeRedirect('/moje-rezervacie?x=1')).toBe('/moje-rezervacie?x=1');
    expect(safeRedirect('/')).toBe('/');
  });

  it('odmietne externé a podvrhnuté adresy (open redirect)', () => {
    for (const evil of [
      'https://zla.sk',
      '//zla.sk',
      '/\\zla.sk',
      'javascript:alert(1)',
      '',
      undefined,
      ['/a'],
    ]) {
      expect(safeRedirect(evil)).toBe('/moje-rezervacie');
    }
  });
});

describe('authErrorMessage', () => {
  it('preloží kódy better-auth a 429', () => {
    expect(authErrorMessage({ code: 'INVALID_EMAIL_OR_PASSWORD', status: 401 })).toBe(
      'Nesprávny e-mail alebo heslo.',
    );
    expect(authErrorMessage({ code: 'USER_ALREADY_EXISTS', status: 422 })).toMatch(/už existuje/);
    expect(authErrorMessage({ status: 429 })).toMatch(/Príliš veľa/);
    expect(authErrorMessage({ code: 'NIECO_INE' })).toMatch(/Nepodarilo sa/);
  });
});
