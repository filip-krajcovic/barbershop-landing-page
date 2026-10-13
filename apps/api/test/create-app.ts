import type { NestExpressApplication } from '@nestjs/platform-express';
import { Test, type TestingModuleBuilder } from '@nestjs/testing';
import { AppModule } from '../src/app.module.js';
import { APP_OPTIONS, setupApp } from '../src/app.setup.js';

/**
 * Celá aplikácia s rovnakým nastavením ako v produkcii (main.ts).
 * `configure` umožní nahradiť providery (napr. SMS sender spy objektom).
 */
export async function createTestApp(
  configure: (builder: TestingModuleBuilder) => TestingModuleBuilder = (b) => b,
): Promise<NestExpressApplication> {
  const moduleRef = await configure(Test.createTestingModule({ imports: [AppModule] })).compile();
  const app = moduleRef.createNestApplication<NestExpressApplication>(APP_OPTIONS);
  setupApp(app);
  await app.init();
  return app;
}
