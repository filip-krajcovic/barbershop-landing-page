import { TZDate } from '@date-fns/tz';
import { BUSINESS_TIMEZONE } from '@britva/shared';

/** Pomocné funkcie pre kalendárne dni (`YYYY-MM-DD`) v časovej zóne prevádzky. */

function parts(date: string): [number, number, number] {
  const [y, m, d] = date.split('-').map(Number) as [number, number, number];
  return [y, m, d];
}

/** Okamih, keď je v prevádzke `date` a `minutes` minút po polnoci (miestny čas, vrátane DST). */
export function zonedTime(date: string, minutes: number, tz = BUSINESS_TIMEZONE): TZDate {
  const [y, m, d] = parts(date);
  return new TZDate(y, m - 1, d, Math.floor(minutes / 60), minutes % 60, tz);
}

/** Dnešný dátum v časovej zóne prevádzky. */
export function todayIn(now: Date, tz = BUSINESS_TIMEZONE): string {
  return formatDate(new TZDate(now.getTime(), tz));
}

/** Dátum posunutý o `days` dní. */
export function addDays(date: string, days: number): string {
  const [y, m, d] = parts(date);
  return new Date(Date.UTC(y, m - 1, d + days)).toISOString().slice(0, 10);
}

/** Deň v týždni: 0 = nedeľa … 6 = sobota. */
export function weekdayOf(date: string): number {
  const [y, m, d] = parts(date);
  return new Date(Date.UTC(y, m - 1, d)).getUTCDay();
}

/** `09:30` alebo `09:30:00` → 570. */
export function timeToMinutes(time: string): number {
  const [h, m] = time.split(':').map(Number) as [number, number];
  return h * 60 + m;
}

/** ISO 8601 s offsetom prevádzky, napr. `2026-10-14T09:00:00.000+02:00`. */
export function toZonedIso(date: Date, tz = BUSINESS_TIMEZONE): string {
  return new TZDate(date.getTime(), tz).toISOString();
}

function formatDate(date: TZDate): string {
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}
