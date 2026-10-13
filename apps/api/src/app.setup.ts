import type { INestApplication } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpExceptionFilter } from './common/filters/http-exception.filter.js';
import type { Env } from './config/env.validation.js';

/** Spoločné nastavenie aplikácie pre main.ts aj e2e testy. */
export function setupApp(app: INestApplication): void {
  const config = app.get<ConfigService<Env, true>>(ConfigService);

  app.setGlobalPrefix('api');
  app.useGlobalFilters(new HttpExceptionFilter());
  app.enableCors({
    origin: config.get('WEB_URL', { infer: true }),
    credentials: true,
  });
  app.enableShutdownHooks();
}
