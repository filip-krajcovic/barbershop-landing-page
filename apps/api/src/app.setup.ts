import type { NestApplicationOptions } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { NestExpressApplication } from '@nestjs/platform-express';
import { toNodeHandler } from 'better-auth/node';
import { AUTH, AUTH_BASE_PATH, type Auth } from './auth/auth.js';
import { HttpExceptionFilter } from './common/filters/http-exception.filter.js';
import type { Env } from './config/env.validation.js';

/**
 * Body parser je vypnutý pri vytvorení aplikácie a zapína sa v `setupApp` až po handleri
 * better-auth – better-auth číta telo requestu sám a s už sparsovaným telom by zamrzol.
 */
export const APP_OPTIONS: NestApplicationOptions = { bodyParser: false };

/** Spoločné nastavenie aplikácie pre main.ts aj e2e testy. Volať pred `init()`/`listen()`. */
export function setupApp(app: NestExpressApplication): void {
  const config = app.get<ConfigService<Env, true>>(ConfigService);

  app.setGlobalPrefix('api');
  app.useGlobalFilters(new HttpExceptionFilter());
  // CORS musí byť pred handlerom better-auth, aby dostal hlavičky aj /api/auth/*.
  app.enableCors({
    origin: config.get('WEB_URL', { infer: true }),
    credentials: true,
  });

  const auth = app.get<Auth>(AUTH);
  app.getHttpAdapter().getInstance().all(`${AUTH_BASE_PATH}/{*path}`, toNodeHandler(auth));

  app.useBodyParser('json', { limit: '100kb' });
  app.useBodyParser('urlencoded', { extended: true, limit: '100kb' });
  app.enableShutdownHooks();
}
