import { defineConfig } from 'vitest/config';
import { testEnv } from './test/test-env.js';

export default defineConfig({
  test: {
    globals: true,
    root: './',
    include: ['test/**/*.e2e-spec.ts'],
    env: testEnv,
    // e2e testy zdieľajú jednu databázu – súbory bežia postupne
    fileParallelism: false,
  },
});
