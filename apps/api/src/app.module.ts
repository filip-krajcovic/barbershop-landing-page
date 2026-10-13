import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AvailabilityModule } from './availability/availability.module.js';
import { AuthModule } from './auth/auth.module.js';
import { BarbersModule } from './barbers/barbers.module.js';
import { validateEnv } from './config/env.validation.js';
import { DatabaseModule } from './database/database.module.js';
import { HealthModule } from './health/health.module.js';
import { ServicesModule } from './services/services.module.js';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      cache: true,
      validate: validateEnv,
    }),
    DatabaseModule,
    AuthModule,
    HealthModule,
    ServicesModule,
    BarbersModule,
    AvailabilityModule,
  ],
})
export class AppModule {}
