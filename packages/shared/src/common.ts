import { z } from 'zod';

export const idSchema = z.uuid();

/** Dátum vo formáte YYYY-MM-DD (kalendárny deň v časovej zóne prevádzky). */
export const dateStringSchema = z.iso.date();

/** ISO 8601 dátum a čas s offsetom, napr. 2026-10-14T09:00:00+02:00. */
export const dateTimeSchema = z.iso.datetime({ offset: true });
