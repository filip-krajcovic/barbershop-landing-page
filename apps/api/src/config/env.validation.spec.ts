import { validateEnv } from './env.validation.js';

const valid = {
  WEB_URL: 'http://localhost:3000',
  DATABASE_URL: 'postgres://britva:britva@localhost:5432/britva',
  BETTER_AUTH_SECRET: 'x'.repeat(32),
  BETTER_AUTH_URL: 'http://localhost:3001',
};

describe('validateEnv', () => {
  it('doplní predvolené hodnoty a prevedie PORT na číslo', () => {
    expect(validateEnv({ ...valid, PORT: '4000' })).toMatchObject({
      NODE_ENV: 'development',
      PORT: 4000,
    });
    expect(validateEnv(valid).PORT).toBe(3001);
  });

  it('prijme postgresql:// aj postgres://', () => {
    expect(() =>
      validateEnv({ ...valid, DATABASE_URL: 'postgresql://u:p@db:5432/britva' }),
    ).not.toThrow();
  });

  it('zlyhá s popisom všetkých neplatných premenných', () => {
    expect(() =>
      validateEnv({ ...valid, DATABASE_URL: 'mysql://x', BETTER_AUTH_SECRET: 'short' }),
    ).toThrow(/DATABASE_URL[\s\S]*BETTER_AUTH_SECRET|BETTER_AUTH_SECRET[\s\S]*DATABASE_URL/);
  });

  it('zlyhá, keď chýba povinná premenná', () => {
    const { WEB_URL: _omit, ...withoutWebUrl } = valid;
    expect(() => validateEnv(withoutWebUrl)).toThrow(/WEB_URL/);
  });

  it('PROXY_SECRET je voliteľný, prázdny = vypnutý, inak aspoň 32 znakov', () => {
    expect(validateEnv(valid).PROXY_SECRET).toBeUndefined();
    expect(validateEnv({ ...valid, PROXY_SECRET: '' }).PROXY_SECRET).toBeUndefined();
    expect(validateEnv({ ...valid, PROXY_SECRET: 'p'.repeat(32) }).PROXY_SECRET).toBe(
      'p'.repeat(32),
    );
    expect(() => validateEnv({ ...valid, PROXY_SECRET: 'kratky' })).toThrow(/PROXY_SECRET/);
  });
});
