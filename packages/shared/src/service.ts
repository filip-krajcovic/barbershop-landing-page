import { z } from 'zod';
import { idSchema } from './common';

export const serviceSchema = z.object({
  id: idSchema,
  slug: z.string().regex(/^[a-z0-9-]+$/),
  name: z.string().min(1).max(100),
  description: z.string().max(500),
  durationMin: z.number().int().positive(),
  priceCents: z.number().int().nonnegative(),
});

export type Service = z.infer<typeof serviceSchema>;
