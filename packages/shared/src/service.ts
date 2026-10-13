import { z } from 'zod';
import { idSchema, nonEmptyPatch, slugSchema } from './common';

export const serviceSchema = z.object({
  id: idSchema,
  slug: slugSchema,
  name: z.string().min(1).max(100),
  description: z.string().max(500),
  durationMin: z.number().int().positive(),
  priceCents: z.number().int().nonnegative(),
});

/** Polia upraviteľné adminom – bez predvolených hodnôt, aby PATCH nič neprepísal. */
const serviceFields = z.object({
  slug: slugSchema,
  name: z.string().trim().min(1).max(100),
  description: z.string().trim().max(500),
  durationMin: z.number().int().positive().max(480),
  priceCents: z.number().int().nonnegative().max(1_000_000),
  sortOrder: z.number().int(),
  active: z.boolean(),
});

export const createServiceSchema = serviceFields.extend({
  description: serviceFields.shape.description.default(''),
  sortOrder: serviceFields.shape.sortOrder.default(0),
  active: serviceFields.shape.active.default(true),
});

export const updateServiceSchema = serviceFields
  .partial()
  .refine(nonEmptyPatch, 'Zadaj aspoň jedno pole na úpravu.');

export type Service = z.infer<typeof serviceSchema>;
export type CreateServiceInput = z.input<typeof createServiceSchema>;
export type CreateService = z.output<typeof createServiceSchema>;
export type UpdateService = z.output<typeof updateServiceSchema>;
