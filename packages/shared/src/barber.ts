import { z } from 'zod';
import { idSchema } from './common';

/** Hodnota barberId, ktorá znamená „ktokoľvek voľný“. */
export const ANY_BARBER = 'any';

export const barberSchema = z.object({
  id: idSchema,
  slug: z.string().regex(/^[a-z0-9-]+$/),
  name: z.string().min(1).max(100),
  role: z.string().max(200),
  avatarUrl: z.url().nullable(),
});

export const barberIdOrAnySchema = z.union([idSchema, z.literal(ANY_BARBER)]);

export type Barber = z.infer<typeof barberSchema>;
export type BarberIdOrAny = z.infer<typeof barberIdOrAnySchema>;
