import { ConflictException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import {
  canCancelBooking,
  type BookingDetails,
  type BookingListQuery,
  type BookingStatus,
  type CreateBooking,
} from '@britva/shared';
import { and, asc, desc, eq, gte, inArray, lt, type SQL } from 'drizzle-orm';
import type { AuthUser } from '../auth/auth.js';
import { addDays, toZonedIso, zonedTime } from '../availability/local-date.js';
import { AvailabilityService } from '../availability/availability.service.js';
import {
  pgErrorCode,
  PG_EXCLUSION_VIOLATION,
  PG_UNIQUE_VIOLATION,
} from '../common/database-errors.js';
import { DRIZZLE, type DrizzleDb } from '../database/database.constants.js';
import { barbers, bookings, services } from '../database/schema/index.js';
import { NotificationsService } from '../notifications/notifications.service.js';
import { generateBookingCode } from './booking-code.util.js';

const ACTIVE_STATUSES: BookingStatus[] = ['pending', 'confirmed'];
const CODE_ATTEMPTS = 3;

const detailsColumns = {
  id: bookings.id,
  code: bookings.code,
  status: bookings.status,
  serviceId: bookings.serviceId,
  barberId: bookings.barberId,
  startsAt: bookings.startsAt,
  endsAt: bookings.endsAt,
  customerName: bookings.customerName,
  phone: bookings.phone,
  note: bookings.note,
  createdAt: bookings.createdAt,
  serviceName: services.name,
  servicePriceCents: services.priceCents,
  barberName: barbers.name,
};

type DetailsRow = Pick<
  typeof bookings.$inferSelect,
  | 'id'
  | 'code'
  | 'status'
  | 'serviceId'
  | 'barberId'
  | 'startsAt'
  | 'endsAt'
  | 'customerName'
  | 'phone'
  | 'note'
  | 'createdAt'
> & { serviceName: string; servicePriceCents: number; barberName: string };

const isAdmin = (user: AuthUser) => user.role === 'admin';

@Injectable()
export class BookingsService {
  constructor(
    @Inject(DRIZZLE) private readonly db: DrizzleDb,
    private readonly availability: AvailabilityService,
    private readonly notifications: NotificationsService,
  ) {}

  /**
   * Vytvorí rezerváciu. Voľnosť termínu sa overí rovnakou logikou ako zobrazené sloty;
   * pred súbežnou rezerváciou toho istého termínu chráni DB constraint `bookings_no_overlap`.
   * Pri „ktokoľvek“ sa pri kolízii skúsi ďalší voľný barber.
   */
  async create(input: CreateBooking, user?: AuthUser, now = new Date()): Promise<BookingDetails> {
    const startsAt = new Date(input.startsAt);
    const { barberIds, durationMin } = await this.availability.freeBarbersAt(
      input.serviceId,
      input.barberId,
      startsAt,
      now,
    );
    const endsAt = new Date(startsAt.getTime() + durationMin * 60_000);

    for (const barberId of barberIds) {
      for (let attempt = 0; attempt < CODE_ATTEMPTS; attempt++) {
        try {
          const [row] = await this.db
            .insert(bookings)
            .values({
              code: generateBookingCode(),
              userId: user?.id ?? null,
              serviceId: input.serviceId,
              barberId,
              startsAt,
              endsAt,
              customerName: input.customerName,
              phone: input.phone,
              note: input.note || null,
              status: 'confirmed',
            })
            .returning({ id: bookings.id });
          const details = await this.getDetails(row!.id);
          await this.notifications.bookingConfirmed({
            code: details.code,
            phone: details.phone,
            startsAt,
            serviceName: details.service.name,
            barberName: details.barber.name,
          });
          return details;
        } catch (error) {
          const code = pgErrorCode(error);
          if (code === PG_UNIQUE_VIOLATION) continue; // kolízia kódu – nový kód
          if (code === PG_EXCLUSION_VIOLATION) break; // barbera medzitým niekto obsadil
          throw error;
        }
      }
    }
    throw new ConflictException('Tento termín už nie je voľný. Vyber si, prosím, iný.');
  }

  /** Rezervácie prihláseného používateľa, najnovšie termíny prvé. */
  async listMine(userId: string): Promise<BookingDetails[]> {
    const rows = await this.detailsQuery(eq(bookings.userId, userId)).orderBy(
      desc(bookings.startsAt),
    );
    return rows.map(toDetails);
  }

  /** Admin: rezervácie zoradené podľa času, voliteľne pre jeden deň a/alebo barbera. */
  async list(query: BookingListQuery): Promise<BookingDetails[]> {
    const conditions: SQL[] = [];
    if (query.date) {
      conditions.push(gte(bookings.startsAt, zonedTime(query.date, 0)));
      conditions.push(lt(bookings.startsAt, zonedTime(addDays(query.date, 1), 0)));
    }
    if (query.barberId) {
      conditions.push(eq(bookings.barberId, query.barberId));
    }
    const rows = await this.detailsQuery(and(...conditions)).orderBy(asc(bookings.startsAt));
    return rows.map(toDetails);
  }

  /**
   * Zrušenie: vlastník najneskôr 12 h vopred, admin kedykoľvek.
   * Cudziu rezerváciu hlásime ako neexistujúcu (404), aby sa nedali hádať ID.
   */
  async cancel(id: string, user: AuthUser, now = new Date()): Promise<BookingDetails> {
    const [booking] = await this.db
      .select({ userId: bookings.userId, status: bookings.status, startsAt: bookings.startsAt })
      .from(bookings)
      .where(eq(bookings.id, id));
    if (!booking || (!isAdmin(user) && booking.userId !== user.id)) {
      throw new NotFoundException('Rezervácia neexistuje.');
    }
    if (!ACTIVE_STATUSES.includes(booking.status)) {
      throw new ConflictException('Rezervácia už je zrušená alebo ukončená.');
    }
    if (!isAdmin(user) && !canCancelBooking(booking.startsAt, now)) {
      throw new ConflictException(
        'Rezerváciu možno bezplatne zrušiť najneskôr 12 hodín vopred. Zavolaj nám, prosím.',
      );
    }

    const updated = await this.db
      .update(bookings)
      .set({ status: 'cancelled', cancelledAt: now })
      .where(and(eq(bookings.id, id), inArray(bookings.status, ACTIVE_STATUSES)))
      .returning({ id: bookings.id });
    if (updated.length === 0) {
      throw new ConflictException('Rezervácia už je zrušená alebo ukončená.');
    }
    return this.getDetails(id);
  }

  private async getDetails(id: string): Promise<BookingDetails> {
    const [row] = await this.detailsQuery(eq(bookings.id, id));
    if (!row) {
      throw new NotFoundException('Rezervácia neexistuje.');
    }
    return toDetails(row);
  }

  private detailsQuery(where: SQL | undefined) {
    return this.db
      .select(detailsColumns)
      .from(bookings)
      .innerJoin(services, eq(services.id, bookings.serviceId))
      .innerJoin(barbers, eq(barbers.id, bookings.barberId))
      .where(where)
      .$dynamic();
  }
}

function toDetails(row: DetailsRow): BookingDetails {
  return {
    id: row.id,
    code: row.code,
    status: row.status,
    serviceId: row.serviceId,
    barberId: row.barberId,
    startsAt: toZonedIso(row.startsAt),
    endsAt: toZonedIso(row.endsAt),
    customerName: row.customerName,
    phone: row.phone,
    note: row.note,
    createdAt: toZonedIso(row.createdAt),
    service: { name: row.serviceName, priceCents: row.servicePriceCents },
    barber: { name: row.barberName },
  };
}
