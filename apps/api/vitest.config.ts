import { defineConfig } from 'vitest/config';
import { testEnv } from './test/test-env.js';

export default defineConfig({
  test: {
    globals: true,
    root: './',
    include: ['src/**/*.spec.ts'],
    env: testEnv,
  },
});
