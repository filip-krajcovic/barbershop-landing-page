import { ExecutionContext, ForbiddenException, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import type { AuthOptions } from './auth.decorator.js';
import { AuthGuard, type AuthenticatedRequest } from './auth.guard.js';
import type { AuthService } from './auth.service.js';

function setup(options: AuthOptions | undefined, session: unknown) {
  const request = { headers: {} } as AuthenticatedRequest;
  const context = {
    getHandler: () => undefined,
    getClass: () => undefined,
    switchToHttp: () => ({ getRequest: () => request }),
  } as unknown as ExecutionContext;
  const reflector = { getAllAndOverride: () => options } as unknown as Reflector;
  const authService = { getSession: vi.fn().mockResolvedValue(session) } as unknown as AuthService;
  return { guard: new AuthGuard(authService, reflector), context, request };
}

const customer = { user: { id: 'u1', role: 'customer' }, session: { id: 's1' } };
const admin = { user: { id: 'u2', role: 'admin' }, session: { id: 's2' } };

describe('AuthGuard', () => {
  it('bez session vyhodí 401', async () => {
    const { guard, context } = setup({}, null);
    await expect(guard.canActivate(context)).rejects.toBeInstanceOf(UnauthorizedException);
  });

  it('optional pustí neprihláseného bez používateľa', async () => {
    const { guard, context, request } = setup({ optional: true }, null);
    await expect(guard.canActivate(context)).resolves.toBe(true);
    expect(request.user).toBeUndefined();
  });

  it('optional doplní prihláseného používateľa', async () => {
    const { guard, context, request } = setup({ optional: true }, customer);
    await expect(guard.canActivate(context)).resolves.toBe(true);
    expect(request.user).toEqual(customer.user);
  });

  it('nesprávna rola vyhodí 403', async () => {
    const { guard, context } = setup({ roles: ['admin'] }, customer);
    await expect(guard.canActivate(context)).rejects.toBeInstanceOf(ForbiddenException);
  });

  it('správna rola prejde a nastaví request.user aj session', async () => {
    const { guard, context, request } = setup({ roles: ['admin'] }, admin);
    await expect(guard.canActivate(context)).resolves.toBe(true);
    expect(request.user).toEqual(admin.user);
    expect(request.session).toEqual(admin.session);
  });

  it('bez metadát vyžaduje iba prihlásenie', async () => {
    const { guard, context } = setup(undefined, customer);
    await expect(guard.canActivate(context)).resolves.toBe(true);
  });
});
