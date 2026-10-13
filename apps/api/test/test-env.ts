/** Premenné prostredia pre testy (CI môže DATABASE_URL prepísať). */
export const testEnv: Record<string, string> = {
  NODE_ENV: 'test',
  PORT: '3001',
  WEB_URL: 'http://localhost:3000',
  DATABASE_URL: process.env.DATABASE_URL ?? 'postgres://britva:britva@localhost:5432/britva_test',
  BETTER_AUTH_SECRET: 'test-secret-test-secret-test-secret-123',
  BETTER_AUTH_URL: 'http://localhost:3001',
};
