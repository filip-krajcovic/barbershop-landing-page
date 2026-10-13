import { ConflictException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import type { CreateService, Service, UpdateService } from '@britva/shared';
import { asc, eq } from 'drizzle-orm';
import { pgErrorCode, PG_UNIQUE_VIOLATION } from '../common/database-errors.js';
import { DRIZZLE, type DrizzleDb } from '../database/database.constants.js';
import { services } from '../database/schema/index.js';

/** Stĺpce vracané klientom (zodpovedajú `serviceSchema`). */
const serviceColumns = {
  id: services.id,
  slug: services.slug,
  name: services.name,
  description: services.description,
  durationMin: services.durationMin,
  priceCents: services.priceCents,
};

@Injectable()
export class ServicesService {
  constructor(@Inject(DRIZZLE) private readonly db: DrizzleDb) {}

  /** Aktívne služby v poradí cenníka. */
  listActive(): Promise<Service[]> {
    return this.db
      .select(serviceColumns)
      .from(services)
      .where(eq(services.active, true))
      .orderBy(asc(services.sortOrder), asc(services.name));
  }

  async create(input: CreateService): Promise<Service> {
    try {
      const [row] = await this.db.insert(services).values(input).returning(serviceColumns);
      return row!;
    } catch (error) {
      throw this.mapError(error);
    }
  }

  async update(id: string, input: UpdateService): Promise<Service> {
    let row: Service | undefined;
    try {
      [row] = await this.db
        .update(services)
        .set(input)
        .where(eq(services.id, id))
        .returning(serviceColumns);
    } catch (error) {
      throw this.mapError(error);
    }
    if (!row) {
      throw new NotFoundException('Služba neexistuje.');
    }
    return row;
  }

  /** Soft delete – služba zmizne z cenníka, existujúce rezervácie ostanú. */
  async deactivate(id: string): Promise<void> {
    const rows = await this.db
      .update(services)
      .set({ active: false })
      .where(eq(services.id, id))
      .returning({ id: services.id });
    if (rows.length === 0) {
      throw new NotFoundException('Služba neexistuje.');
    }
  }

  private mapError(error: unknown): unknown {
    if (pgErrorCode(error) === PG_UNIQUE_VIOLATION) {
      return new ConflictException('Služba s týmto slugom už existuje.');
    }
    return error;
  }
}
