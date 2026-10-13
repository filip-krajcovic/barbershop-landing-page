import { applyDecorators, SetMetadata, UseGuards } from '@nestjs/common';
import type { UserRole } from '@britva/shared';
import { AuthGuard } from './auth.guard.js';

export const AUTH_OPTIONS = Symbol('AUTH_OPTIONS');

export interface AuthOptions {
  /** Povolené roly; bez uvedenia stačí ľubovoľný prihlásený používateľ. */
  roles?: UserRole[];
  /** Neprihlásený používateľ prejde, prihlásenému sa doplní `request.user`. */
  optional?: boolean;
}

/**
 * Ochrana endpointu session z better-auth.
 *
 * - `@Auth()` – iba prihlásení (inak 401)
 * - `@Auth({ roles: ['admin'] })` – iba admin (inak 403)
 * - `@Auth({ optional: true })` – verejné, ale s `@CurrentUser()`, ak je prihlásený
 */
export function Auth(options: AuthOptions = {}) {
  return applyDecorators(SetMetadata(AUTH_OPTIONS, options), UseGuards(AuthGuard));
}
