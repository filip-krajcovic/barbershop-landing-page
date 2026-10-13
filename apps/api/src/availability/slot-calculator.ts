import { MIN_LEAD_TIME_MIN, SLOT_INTERVAL_MIN } from '@britva/shared';
import { zonedTime } from './local-date.js';

export interface Interval {
  start: Date;
  end: Date;
}

/** Barber, ktorý v daný deň pracuje. */
export interface BarberDay {
  barberId: string;
  /** Otváracie hodiny v minútach od polnoci (miestny čas). */
  opensAtMin: number;
  closesAtMin: number;
  /** Rezervácie a voľno, ktoré v daný deň blokujú čas. */
  busy: Interval[];
}

export interface ComputedSlot {
  startsAt: Date;
  endsAt: Date;
  /** Barberi voľní pre celý slot, v poradí vstupu (podľa sort_order). */
  freeBarberIds: string[];
}

export interface DaySlotsParams {
  date: string;
  durationMin: number;
  barbers: BarberDay[];
  now: Date;
  intervalMin?: number;
  leadTimeMin?: number;
}

const overlaps = (a: Interval, b: Interval) => a.start < b.end && b.start < a.end;

/**
 * Sloty pre jeden deň. Začiatky sú na mriežke `intervalMin` od polnoci,
 * služba sa musí celá zmestiť do otváracích hodín barbera. Slot sa vráti, ak spadá
 * do hodín aspoň jedného barbera; voľný je, ak ho aspoň jeden barber má voľný
 * a začína najskôr `leadTimeMin` od teraz.
 */
export function computeDaySlots({
  date,
  durationMin,
  barbers,
  now,
  intervalMin = SLOT_INTERVAL_MIN,
  leadTimeMin = MIN_LEAD_TIME_MIN,
}: DaySlotsParams): ComputedSlot[] {
  if (barbers.length === 0) {
    return [];
  }
  const earliest = Math.min(...barbers.map((b) => b.opensAtMin));
  const latest = Math.max(...barbers.map((b) => b.closesAtMin));
  const firstStart = Math.ceil(earliest / intervalMin) * intervalMin;
  const bookableFrom = now.getTime() + leadTimeMin * 60_000;
  const slots: ComputedSlot[] = [];

  for (let minute = firstStart; minute + durationMin <= latest; minute += intervalMin) {
    const startsAt = new Date(zonedTime(date, minute).getTime());
    const endsAt = new Date(startsAt.getTime() + durationMin * 60_000);
    const slot: Interval = { start: startsAt, end: endsAt };

    const working = barbers.filter(
      (b) => minute >= b.opensAtMin && minute + durationMin <= b.closesAtMin,
    );
    if (working.length === 0) {
      continue;
    }
    const freeBarberIds =
      startsAt.getTime() < bookableFrom
        ? []
        : working.filter((b) => !b.busy.some((i) => overlaps(i, slot))).map((b) => b.barberId);

    slots.push({ startsAt, endsAt, freeBarberIds });
  }
  return slots;
}
