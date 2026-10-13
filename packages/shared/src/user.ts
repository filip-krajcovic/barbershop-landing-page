import { z } from 'zod';

export const userRoleSchema = z.enum(['customer', 'admin']);

/** Prihlásený používateľ, ako ho vracia `GET /api/me`. */
export const meSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.email(),
  role: userRoleSchema,
  phone: z.string().nullable(),
});

export type UserRole = z.infer<typeof userRoleSchema>;
export type Me = z.infer<typeof meSchema>;
