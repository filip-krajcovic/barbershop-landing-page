import { z } from 'zod';

export const idSchema = z.uuid();

/** Dátum vo formáte YYYY-MM-DD (kalendárny deň v časovej zóne prevádzky). */
export const dateStringSchema = z.iso.date();

/** ISO 8601 dátum a čas s offsetom, napr. 2026-10-14T09:00:00+02:00. */
export const dateTimeSchema = z.iso.datetime({ offset: true });

/** URL-friendly identifikátor: malé písmená, číslice a pomlčky (napr. `skin-fade`). */
export const slugSchema = z
  .string()
  .min(1)
  .max(64)
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Slug môže obsahovať iba malé písmená, číslice a pomlčky.');

/** Aspoň jedno pole musí byť vyplnené (PATCH). */
export const nonEmptyPatch = <T extends Record<string, unknown>>(value: T) =>
  Object.values(value).some((v) => v !== undefined);
