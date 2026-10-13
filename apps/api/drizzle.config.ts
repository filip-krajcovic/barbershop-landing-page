import { defineConfig } from 'drizzle-kit';

// Načíta apps/api/.env, ak existuje (v CI sú premenné nastavené priamo).
try {
  process.loadEnvFile('.env');
} catch {
  // .env nie je povinný
}

export default defineConfig({
  dialect: 'postgresql',
  schema: './src/database/schema/index.ts',
  out: './drizzle',
  casing: 'snake_case',
  strict: true,
  verbose: true,
  dbCredentials: {
    url: process.env.DATABASE_URL ?? '',
  },
});
