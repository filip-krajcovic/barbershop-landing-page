import { z } from 'zod';
import { idSchema, nonEmptyPatch, slugSchema } from './common';

/** Hodnota barberId, ktorá znamená „ktokoľvek voľný“. */
export const ANY_BARBER = 'any';

export const barberSchema = z.object({
  id: idSchema,
  slug: slugSchema,
  name: z.string().min(1).max(100),
  role: z.string().max(200),
  avatarUrl: z.url().nullable(),
});

export const barberIdOrAnySchema = z.union([idSchema, z.literal(ANY_BARBER)]);

export const barberListQuerySchema = z.object({
  /** Iba barberi, ktorí robia túto službu. */
  serviceId: idSchema.optional(),
});

/** Polia upraviteľné adminom – bez predvolených hodnôt, aby PATCH nič neprepísal. */
const barberFields = z.object({
  slug: slugSchema,
  name: z.string().trim().min(1).max(100),
  role: z.string().trim().max(200),
  avatarUrl: z.url().nullable(),
  sortOrder: z.number().int(),
  active: z.boolean(),
  /** Služby, ktoré barber robí; pri úprave nahradí pôvodný zoznam. */
  serviceIds: z.array(idSchema).max(100),
});

export const createBarberSchema = barberFields.extend({
  role: barberFields.shape.role.default(''),
  avatarUrl: barberFields.shape.avatarUrl.default(null),
  sortOrder: barberFields.shape.sortOrder.default(0),
  active: barberFields.shape.active.default(true),
  serviceIds: barberFields.shape.serviceIds.default([]),
});

export const updateBarberSchema = barberFields
  .partial()
  .refine(nonEmptyPatch, 'Zadaj aspoň jedno pole na úpravu.');

export type Barber = z.infer<typeof barberSchema>;
export type BarberIdOrAny = z.infer<typeof barberIdOrAnySchema>;
export type BarberListQuery = z.infer<typeof barberListQuerySchema>;
export type CreateBarberInput = z.input<typeof createBarberSchema>;
export type CreateBarber = z.output<typeof createBarberSchema>;
export type UpdateBarber = z.output<typeof updateBarberSchema>;
