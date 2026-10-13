import { Controller, Get, Inject, Logger, ServiceUnavailableException } from '@nestjs/common';
import type { Pool } from 'pg';
import { PG_POOL } from '../database/database.constants.js';

export interface HealthStatus {
  status: 'ok';
  database: 'ok';
}

@Controller('health')
export class HealthController {
  private readonly logger = new Logger(HealthController.name);

  constructor(@Inject(PG_POOL) private readonly pool: Pool) {}

  @Get()
  async check(): Promise<HealthStatus> {
    try {
      await this.pool.query('SELECT 1');
    } catch (error) {
      this.logger.error(`Databáza je nedostupná: ${String(error)}`);
      throw new ServiceUnavailableException('Databáza je nedostupná.');
    }
    return { status: 'ok', database: 'ok' };
  }
}
