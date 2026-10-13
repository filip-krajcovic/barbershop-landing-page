import { Global, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { Env } from '../config/env.validation.js';
import { DRIZZLE, type DrizzleDb } from '../database/database.constants.js';
import { AUTH, createAuth } from './auth.js';
import { AuthGuard } from './auth.guard.js';
import { AuthService } from './auth.service.js';
import { MeController } from './me.controller.js';

/**
 * Autentifikácia cez better-auth. Handler `/api/auth/*` sa mountuje priamo na Express
 * v `setupApp` (musí dostať request ešte pred body parserom).
 */
@Global()
@Module({
  controllers: [MeController],
  providers: [
    {
      provide: AUTH,
      inject: [DRIZZLE, ConfigService],
      useFactory: (db: DrizzleDb, config: ConfigService<Env, true>) =>
        createAuth(db, {
          BETTER_AUTH_SECRET: config.get('BETTER_AUTH_SECRET', { infer: true }),
          BETTER_AUTH_URL: config.get('BETTER_AUTH_URL', { infer: true }),
          WEB_URL: config.get('WEB_URL', { infer: true }),
        }),
    },
    AuthService,
    AuthGuard,
  ],
  exports: [AUTH, AuthService, AuthGuard],
})
export class AuthModule {}
