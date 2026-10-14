/** Časová zóna prevádzky – všetky otváracie hodiny a sloty sa počítajú v nej. */
export const BUSINESS_TIMEZONE = 'Europe/Bratislava';

/** Krok, v ktorom začínajú sloty (min). */
export const SLOT_INTERVAL_MIN = 30;

/** Najkratší čas od teraz, na ktorý sa dá rezervovať (min). */
export const MIN_LEAD_TIME_MIN = 30;

/** Ako ďaleko dopredu sa dá rezervovať (dni). */
export const BOOKING_HORIZON_DAYS = 14;

/** Bezplatné zrušenie najneskôr toľko hodín pred začiatkom termínu. */
export const CANCELLATION_DEADLINE_HOURS = 12;

/** Dá sa rezervácia ešte zrušiť zákazníkom? */
export function canCancelBooking(startsAt: Date, now: Date = new Date()): boolean {
  return startsAt.getTime() - now.getTime() >= CANCELLATION_DEADLINE_HOURS * 60 * 60 * 1000;
}

/**
 * Hlavička, ktorou sa server webu preukazuje API (web `NUXT_API_PROXY_SECRET` = API `PROXY_SECRET`).
 * Web preposiela `/api/**` na API, aby bola session cookie na doméne webu.
 */
export const PROXY_SECRET_HEADER = 'x-britva-proxy-secret';

/** IP adresa návštevníka pre rate limit v API. API jej verí iba so správnou `PROXY_SECRET_HEADER`. */
export const CLIENT_IP_HEADER = 'x-britva-client-ip';
