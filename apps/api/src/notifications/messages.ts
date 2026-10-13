import { TZDate } from '@date-fns/tz';
import { BUSINESS_TIMEZONE } from '@britva/shared';

export interface BookingMessageData {
  code: string;
  startsAt: Date;
  serviceName: string;
  barberName: string;
}

const DAYS = ['nedeľa', 'pondelok', 'utorok', 'streda', 'štvrtok', 'piatok', 'sobota'];

/** Napr. „utorok 14. 10. o 9:30“ v miestnom čase prevádzky. */
export function formatLocalDateTime(date: Date): string {
  const d = new TZDate(date.getTime(), BUSINESS_TIMEZONE);
  const minutes = String(d.getMinutes()).padStart(2, '0');
  return `${DAYS[d.getDay()]} ${d.getDate()}. ${d.getMonth() + 1}. o ${d.getHours()}:${minutes}`;
}

export function confirmationText(b: BookingMessageData): string {
  return `Britva Barber: ${b.serviceName} u ${b.barberName} je potvrdený na ${formatLocalDateTime(b.startsAt)}. Kód ${b.code}. Bezplatné zrušenie do 12 h vopred.`;
}

export function reminderText(b: BookingMessageData): string {
  return `Britva Barber: pripomíname zajtrajší termín – ${b.serviceName} u ${b.barberName}, ${formatLocalDateTime(b.startsAt)}. Štefánikova 8, Trnava. Kód ${b.code}.`;
}
