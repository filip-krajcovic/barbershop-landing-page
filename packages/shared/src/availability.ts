import { z } from 'zod';
import { barberIdOrAnySchema } from './barber';
import { dateStringSchema, dateTimeSchema, idSchema } from './common';

export const availabilityQuerySchema = z.object({
  serviceId: idSchema,
  barberId: barberIdOrAnySchema,
  date: dateStringSchema,
});

export const slotSchema = z.object({
  startsAt: dateTimeSchema,
  endsAt: dateTimeSchema,
  available: z.boolean(),
});

export const availabilityResponseSchema = z.object({
  date: dateStringSchema,
  slots: z.array(slotSchema),
});

export const nextFreeSlotQuerySchema = z.object({
  serviceId: idSchema,
});

/** Najbližší voľný termín; `null`, ak v horizonte rezervácií nie je žiadny. */
export const nextFreeSlotSchema = z
  .object({
    serviceId: idSchema,
    barberId: idSchema,
    startsAt: dateTimeSchema,
    endsAt: dateTimeSchema,
  })
  .nullable();

/**
 * Odpoveď `GET /api/availability/next-free`. Obalené v objekte, pretože NestJS
 * pri návratovej hodnote `null` posiela prázdne telo namiesto JSON `null`.
 */
export const nextFreeSlotResponseSchema = z.object({ slot: nextFreeSlotSchema });

export type AvailabilityQuery = z.infer<typeof availabilityQuerySchema>;
export type Slot = z.infer<typeof slotSchema>;
export type AvailabilityResponse = z.infer<typeof availabilityResponseSchema>;
export type NextFreeSlotQuery = z.infer<typeof nextFreeSlotQuerySchema>;
export type NextFreeSlot = z.infer<typeof nextFreeSlotSchema>;
export type NextFreeSlotResponse = z.infer<typeof nextFreeSlotResponseSchema>;
