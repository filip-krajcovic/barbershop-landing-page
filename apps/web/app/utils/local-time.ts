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

/** Dnešný dátum (YYYY-MM-DD) v časovej zóne prevádzky. */
export function businessToday(now: Date = new Date()): string {
  return localParts(now).date;
}

/** Kalendárny deň posunutý o `days` dní. */
export function addDays(date: string, days: number): string {
  const [y, m, d] = date.split('-').map(Number) as [number, number, number];
  return new Date(Date.UTC(y, m - 1, d + days)).toISOString().slice(0, 10);
}

/** 0 = nedeľa … 6 = sobota pre kalendárny deň YYYY-MM-DD. */
export function weekdayOf(date: string): number {
  const [y, m, d] = date.split('-').map(Number) as [number, number, number];
  return new Date(Date.UTC(y, m - 1, d)).getUTCDay();
}

const LONG_DAYS = ['nedeľa', 'pondelok', 'utorok', 'streda', 'štvrtok', 'piatok', 'sobota'];
const SHORT_MONTHS = [
  'jan',
  'feb',
  'mar',
  'apr',
  'máj',
  'jún',
  'júl',
  'aug',
  'sep',
  'okt',
  'nov',
  'dec',
];

export interface DayOption {
  date: string;
  /** „Dnes“ alebo skrátený deň „Po“ */
  dow: string;
  day: number;
  month: string;
}

/** Nasledujúcich `count` dní, keď má prevádzka otvorené (bez nedieľ), od dnes. */
export function upcomingDays(count: number, now: Date = new Date()): DayOption[] {
  const today = businessToday(now);
  const days: DayOption[] = [];
  for (let i = 0; days.length < count && i < count * 2; i++) {
    const date = addDays(today, i);
    const weekday = weekdayOf(date);
    if (weekday === 0) continue;
    const [, m, d] = date.split('-').map(Number) as [number, number, number];
    days.push({
      date,
      dow: i === 0 ? 'Dnes' : SHORT_DAYS[weekday]!,
      day: d,
      month: SHORT_MONTHS[m - 1]!,
    });
  }
  return days;
}

/** „streda 14. 10.“ pre kalendárny deň YYYY-MM-DD. */
export function formatLongDate(date: string): string {
  const [, m, d] = date.split('-').map(Number) as [number, number, number];
  return `${LONG_DAYS[weekdayOf(date)]} ${d}. ${m}.`;
}
