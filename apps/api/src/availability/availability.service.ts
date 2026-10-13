import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import {
  ANY_BARBER,
  BOOKING_HORIZON_DAYS,
  type AvailabilityQuery,
  type AvailabilityResponse,
  type BarberIdOrAny,
  type NextFreeSlot,
} from '@britva/shared';
import { and, asc, eq, gt, inArray, lt } from 'drizzle-orm';
import { DRIZZLE, type DrizzleDb } from '../database/database.constants.js';
import {
  barberServices,
  barbers,
  bookings,
  services,
  timeOff,
  workingHours,
} from '../database/schema/index.js';
import { addDays, timeToMinutes, todayIn, toZonedIso, weekdayOf, zonedTime } from './local-date.js';
import {
  computeDaySlots,
  type BarberDay,
  type ComputedSlot,
  type Interval,
} from './slot-calculator.js';

/** Stavy rezervácie, ktoré blokujú termín (zhodne s constraintom bookings_no_overlap). */
const BLOCKING_STATUSES = ['pending', 'confirmed'] as const;

interface Context {
  durationMin: number;
  /** Barberi v poradí sort_order. */
  barberIds: string[];
  hours: Map<string, Map<number, { opensAtMin: number; closesAtMin: number }>>;
  busy: Map<string, Interval[]>;
}

@Injectable()
export class AvailabilityService {
  constructor(@Inject(DRIZZLE) private readonly db: DrizzleDb) {}

  /** Sloty pre jeden deň. Deň mimo horizontu rezervácií (minulosť, > 14 dní) nemá sloty. */
  async getDay(query: AvailabilityQuery, now = new Date()): Promise<AvailabilityResponse> {
    const ctx = await this.loadContext(query.serviceId, query.barberId, query.date, query.date);
    if (!this.inHorizon(query.date, now)) {
      return { date: query.date, slots: [] };
    }
    const slots = this.daySlots(ctx, query.date, now).map((s) => ({
      startsAt: toZonedIso(s.startsAt),
      endsAt: toZonedIso(s.endsAt),
      available: s.freeBarberIds.length > 0,
    }));
    return { date: query.date, slots };
  }

  /** Najbližší voľný termín u ktoréhokoľvek barbera v horizonte rezervácií. */
  async nextFree(serviceId: string, now = new Date()): Promise<NextFreeSlot> {
    const today = todayIn(now);
    const last = addDays(today, BOOKING_HORIZON_DAYS);
    const ctx = await this.loadContext(serviceId, ANY_BARBER, today, last);
    for (let date = today; date <= last; date = addDays(date, 1)) {
      const slot = this.daySlots(ctx, date, now).find((s) => s.freeBarberIds.length > 0);
      if (slot) {
        return {
          serviceId,
          barberId: slot.freeBarberIds[0]!,
          startsAt: toZonedIso(slot.startsAt),
          endsAt: toZonedIso(slot.endsAt),
        };
      }
    }
    return null;
  }

  /**
   * Barberi voľní presne od `startsAt` pre danú službu (v poradí sort_order).
   * Prázdne pole, ak čas nie je na mriežke, je mimo otváracích hodín alebo obsadený.
   */
  async freeBarbersAt(
    serviceId: string,
    barberId: BarberIdOrAny,
    startsAt: Date,
    now = new Date(),
  ): Promise<{ barberIds: string[]; durationMin: number }> {
    const date = todayIn(startsAt);
    const ctx = await this.loadContext(serviceId, barberId, date, date);
    if (!this.inHorizon(date, now)) {
      return { barberIds: [], durationMin: ctx.durationMin };
    }
    const slot = this.daySlots(ctx, date, now).find(
      (s) => s.startsAt.getTime() === startsAt.getTime(),
    );
    return { barberIds: slot?.freeBarberIds ?? [], durationMin: ctx.durationMin };
  }

  private inHorizon(date: string, now: Date): boolean {
    const today = todayIn(now);
    return date >= today && date <= addDays(today, BOOKING_HORIZON_DAYS);
  }

  private daySlots(ctx: Context, date: string, now: Date): ComputedSlot[] {
    const weekday = weekdayOf(date);
    const dayStart = zonedTime(date, 0);
    const dayEnd = zonedTime(addDays(date, 1), 0);
    const barberDays: BarberDay[] = [];
    for (const barberId of ctx.barberIds) {
      const hours = ctx.hours.get(barberId)?.get(weekday);
      if (!hours) continue;
      const busy = (ctx.busy.get(barberId) ?? []).filter(
        (i) => i.start < dayEnd && i.end > dayStart,
      );
      barberDays.push({ barberId, ...hours, busy });
    }
    return computeDaySlots({ date, durationMin: ctx.durationMin, barbers: barberDays, now });
  }

  /** Načíta všetko potrebné pre dni `from`…`to` naraz (4 dotazy bez ohľadu na počet dní). */
  private async loadContext(
    serviceId: string,
    barberId: BarberIdOrAny,
    from: string,
    to: string,
  ): Promise<Context> {
    const [service] = await this.db
      .select({ durationMin: services.durationMin })
      .from(services)
      .where(and(eq(services.id, serviceId), eq(services.active, true)));
    if (!service) {
      throw new NotFoundException('Služba neexistuje.');
    }

    const barberRows = await this.db
      .select({ id: barbers.id })
      .from(barbers)
      .innerJoin(barberServices, eq(barberServices.barberId, barbers.id))
      .where(
        and(
          eq(barbers.active, true),
          eq(barberServices.serviceId, serviceId),
          barberId === ANY_BARBER ? undefined : eq(barbers.id, barberId),
        ),
      )
      .orderBy(asc(barbers.sortOrder), asc(barbers.name));
    if (barberId !== ANY_BARBER && barberRows.length === 0) {
      throw new NotFoundException('Barber neexistuje alebo túto službu nerobí.');
    }
    const barberIds = barberRows.map((b) => b.id);
    const ctx: Context = {
      durationMin: service.durationMin,
      barberIds,
      hours: new Map(),
      busy: new Map(),
    };
    if (barberIds.length === 0) {
      return ctx;
    }

    const rangeStart = zonedTime(from, 0);
    const rangeEnd = zonedTime(addDays(to, 1), 0);
    const [hourRows, timeOffRows, bookingRows] = await Promise.all([
      this.db
        .select({
          barberId: workingHours.barberId,
          weekday: workingHours.weekday,
          opensAt: workingHours.opensAt,
          closesAt: workingHours.closesAt,
        })
        .from(workingHours)
        .where(inArray(workingHours.barberId, barberIds)),
      this.db
        .select({ barberId: timeOff.barberId, start: timeOff.startsAt, end: timeOff.endsAt })
        .from(timeOff)
        .where(
          and(
            inArray(timeOff.barberId, barberIds),
            lt(timeOff.startsAt, rangeEnd),
            gt(timeOff.endsAt, rangeStart),
          ),
        ),
      this.db
        .select({ barberId: bookings.barberId, start: bookings.startsAt, end: bookings.endsAt })
        .from(bookings)
        .where(
          and(
            inArray(bookings.barberId, barberIds),
            inArray(bookings.status, [...BLOCKING_STATUSES]),
            lt(bookings.startsAt, rangeEnd),
            gt(bookings.endsAt, rangeStart),
          ),
        ),
    ]);

    for (const h of hourRows) {
      const byDay = ctx.hours.get(h.barberId) ?? new Map();
      byDay.set(h.weekday, {
        opensAtMin: timeToMinutes(h.opensAt),
        closesAtMin: timeToMinutes(h.closesAt),
      });
      ctx.hours.set(h.barberId, byDay);
    }
    for (const b of [...timeOffRows, ...bookingRows]) {
      const list = ctx.busy.get(b.barberId) ?? [];
      list.push({ start: b.start, end: b.end });
      ctx.busy.set(b.barberId, list);
    }
    return ctx;
  }
}
