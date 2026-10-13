import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import type { AuthUser } from './auth.js';
import type { AuthenticatedRequest } from './auth.guard.js';

/** Prihlásený používateľ (vyžaduje `@Auth()`); pri `@Auth({ optional: true })` môže byť `undefined`. */
export const CurrentUser = createParamDecorator(
  (_data: unknown, context: ExecutionContext): AuthUser | undefined =>
    context.switchToHttp().getRequest<AuthenticatedRequest>().user,
);
