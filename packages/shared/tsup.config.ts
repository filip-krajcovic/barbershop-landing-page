import { defineConfig } from 'tsup';

export default defineConfig((options) => ({
  entry: ['src/index.ts'],
  format: ['esm', 'cjs'],
  dts: true,
  // Vo watch režime (pnpm dev) dist/ nemazať: typy (index.d.ts) sa generujú
  // ~2 s a API by sa medzitým skompilovalo bez nich (TS7016).
  clean: !options.watch,
  sourcemap: true,
  target: 'es2022',
}));
