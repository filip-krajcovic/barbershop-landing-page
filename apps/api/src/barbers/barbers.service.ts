import {
  BadRequestException,
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import type { Barber, CreateBarber, UpdateBarber } from '@britva/shared';
import { and, asc, eq } from 'drizzle-orm';
import {
  pgErrorCode,
  PG_FOREIGN_KEY_VIOLATION,
  PG_UNIQUE_VIOLATION,
} from '../common/database-errors.js';
import { DRIZZLE, type DrizzleDb } from '../database/database.constants.js';
import { barberServices, barbers } from '../database/schema/index.js';

/** Stĺpce vracané klientom (zodpovedajú `barberSchema`). */
const barberColumns = {
  id: barbers.id,
  slug: barbers.slug,
  name: barbers.name,
  role: barbers.role,
  avatarUrl: barbers.avatarUrl,
};

type Tx = Parameters<Parameters<DrizzleDb['transaction']>[0]>[0];

@Injectable()
export class BarbersService {
  constructor(@Inject(DRIZZLE) private readonly db: DrizzleDb) {}

  /** Aktívni barberi; so `serviceId` iba tí, ktorí danú službu robia. */
  listActive(serviceId?: string): Promise<Barber[]> {
    const order = [asc(barbers.sortOrder), asc(barbers.name)];
    if (!serviceId) {
      return this.db
        .select(barberColumns)
        .from(barbers)
        .where(eq(barbers.active, true))
        .orderBy(...order);
    }
    return this.db
      .select(barberColumns)
      .from(barbers)
      .innerJoin(barberServices, eq(barberServices.barberId, barbers.id))
      .where(and(eq(barbers.active, true), eq(barberServices.serviceId, serviceId)))
      .orderBy(...order);
  }

  async create(input: CreateBarber): Promise<Barber> {
    const { serviceIds, ...fields } = input;
    try {
      return await this.db.transaction(async (tx) => {
        const [row] = await tx.insert(barbers).values(fields).returning(barberColumns);
        await this.replaceServices(tx, row!.id, serviceIds);
        return row!;
      });
    } catch (error) {
      throw this.mapError(error);
    }
  }

  async update(id: string, input: UpdateBarber): Promise<Barber> {
    const { serviceIds, ...fields } = input;
    let row: Barber | undefined;
    try {
      row = await this.db.transaction(async (tx) => {
        const [updated] =
          Object.keys(fields).length > 0
            ? await tx
                .update(barbers)
                .set(fields)
                .where(eq(barbers.id, id))
                .returning(barberColumns)
            : await tx.select(barberColumns).from(barbers).where(eq(barbers.id, id));
        if (updated && serviceIds) {
          await this.replaceServices(tx, id, serviceIds);
        }
        return updated;
      });
    } catch (error) {
      throw this.mapError(error);
    }
    if (!row) {
      throw new NotFoundException('Barber neexistuje.');
    }
    return row;
  }

  /** Soft delete – barber sa prestane ponúkať, existujúce rezervácie ostanú. */
  async deactivate(id: string): Promise<void> {
    const rows = await this.db
      .update(barbers)
      .set({ active: false })
      .where(eq(barbers.id, id))
      .returning({ id: barbers.id });
    if (rows.length === 0) {
      throw new NotFoundException('Barber neexistuje.');
    }
  }

  private async replaceServices(tx: Tx, barberId: string, serviceIds: string[]): Promise<void> {
    await tx.delete(barberServices).where(eq(barberServices.barberId, barberId));
    const unique = [...new Set(serviceIds)];
    if (unique.length > 0) {
      await tx.insert(barberServices).values(unique.map((serviceId) => ({ barberId, serviceId })));
    }
  }

  private mapError(error: unknown): unknown {
    switch (pgErrorCode(error)) {
      case PG_UNIQUE_VIOLATION:
        return new ConflictException('Barber s týmto slugom už existuje.');
      case PG_FOREIGN_KEY_VIOLATION:
        return new BadRequestException('Niektorá zo zadaných služieb neexistuje.');
      default:
        return error;
    }
  }
}
