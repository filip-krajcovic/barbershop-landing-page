import { z } from 'zod';
import { barberIdOrAnySchema } from './barber';
import { dateTimeSchema, idSchema } from './common';

export const bookingStatusSchema = z.enum(['pending', 'confirmed', 'cancelled', 'completed']);

/** Kód rezervácie, ktorý zákazník dostane v SMS, napr. BB-7K3QXM. */
export const bookingCodeSchema = z.string().regex(/^BB-[A-Z0-9]{4,8}$/);

/**
 * Telefón: povolené číslice, medzery a úvodné „+“, aspoň 9 číslic.
 * Výstupom je číslo bez medzier (napr. +421900123456).
 */
export const phoneSchema = z
  .string()
  .trim()
  .regex(/^\+?[0-9 ]+$/, 'Telefón môže obsahovať iba číslice, medzery a úvodné +.')
  .transform((value) => value.replace(/ /g, ''))
  .refine((value) => {
    const digits = value.replace('+', '').length;
    return digits >= 9 && digits <= 15;
  }, 'Telefón musí mať 9 až 15 číslic.');

export const createBookingSchema = z.object({
  serviceId: idSchema,
  barberId: barberIdOrAnySchema,
  startsAt: dateTimeSchema,
  customerName: z.string().trim().min(2, 'Zadaj meno.').max(100),
  phone: phoneSchema,
  note: z.string().trim().max(500).optional(),
});

export const bookingSchema = z.object({
  id: idSchema,
  code: bookingCodeSchema,
  status: bookingStatusSchema,
  serviceId: idSchema,
  barberId: idSchema,
  startsAt: dateTimeSchema,
  endsAt: dateTimeSchema,
  customerName: z.string(),
  phone: z.string(),
  note: z.string().nullable(),
  createdAt: dateTimeSchema,
});

/** Rezervácia s údajmi potrebnými na zobrazenie (zoznam „Moje rezervácie“, potvrdenie). */
export const bookingDetailsSchema = bookingSchema.extend({
  service: z.object({ name: z.string(), priceCents: z.number().int() }),
  barber: z.object({ name: z.string() }),
});

export type BookingStatus = z.infer<typeof bookingStatusSchema>;
export type CreateBookingInput = z.input<typeof createBookingSchema>;
export type CreateBooking = z.output<typeof createBookingSchema>;
export type Booking = z.infer<typeof bookingSchema>;
export type BookingDetails = z.infer<typeof bookingDetailsSchema>;
