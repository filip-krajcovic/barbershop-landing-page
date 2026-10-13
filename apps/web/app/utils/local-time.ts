import { BUSINESS_TIMEZONE } from '@britva/shared';

export interface LocalParts {
  /** YYYY-MM-DD v časovej zóne prevádzky */
  date: string;
  /** 0 = nedeľa … 6 = sobota */
  weekday: number;
  day: number;
  month: number;
  hour: number;
  minute: number;
}

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const formatter = new Intl.DateTimeFormat('en-US', {
  timeZone: BUSINESS_TIMEZONE,
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
  weekday: 'short',
  hour: '2-digit',
  minute: '2-digit',
  hourCycle: 'h23',
});

/** Časti dátumu v časovej zóne prevádzky (nezávisle od zóny prehliadača). */
export function localParts(date: Date): LocalParts {
  const p = Object.fromEntries(formatter.formatToParts(date).map((x) => [x.type, x.value]));
  return {
    date: `${p.year}-${p.month}-${p.day}`,
    weekday: WEEKDAYS.indexOf(p.weekday!),
    day: Number(p.day),
    month: Number(p.month),
    hour: Number(p.hour),
    minute: Number(p.minute),
  };
}

/** `9:05` */
export function formatTime(date: Date): string {
  const { hour, minute } = localParts(date);
  return `${hour}:${String(minute).padStart(2, '0')}`;
}

const SHORT_DAYS = ['Ne', 'Po', 'Ut', 'St', 'Št', 'Pi', 'So'];

/** „Dnes“, „Zajtra“ alebo „Ut 14. 10.“ podľa miestneho dátumu prevádzky. */
export function formatDayLabel(date: Date, now: Date = new Date()): string {
  const target = localParts(date);
  const today = localParts(now);
  const tomorrow = localParts(new Date(now.getTime() + 24 * 3600_000));
  if (target.date === today.date) return 'Dnes';
  if (target.date === tomorrow.date) return 'Zajtra';
  return `${SHORT_DAYS[target.weekday]} ${target.day}. ${target.month}.`;
}

/** Popis slotu do karty „Najbližší voľný termín“, napr. „Dnes · 17:30“. */
export function formatSlotLabel(iso: string, now: Date = new Date()): string {
  const date = new Date(iso);
  return `${formatDayLabel(date, now)} · ${formatTime(date)}`;
}
