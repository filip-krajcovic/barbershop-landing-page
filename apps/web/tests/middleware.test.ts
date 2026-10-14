import { mockNuxtImport } from '@nuxt/test-utils/runtime';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { RouteLocationNormalized } from 'vue-router';
import { clearNuxtState } from '#imports';
import authMiddleware from '~/middleware/auth';
import guestMiddleware from '~/middleware/guest';

const { authClient, navigate } = vi.hoisted(() => ({
  authClient: { getSession: vi.fn() },
  navigate: vi.fn(),
}));

mockNuxtImport('useAuthClient', () => () => authClient);
mockNuxtImport('navigateTo', () => navigate);

const route = (fullPath: string) => ({ fullPath }) as RouteLocationNormalized;

beforeEach(() => {
  clearNuxtState(['auth-user', 'auth-loaded']);
  authClient.getSession.mockReset();
  navigate.mockReset();
});

describe('middleware pri nedostupnom API', () => {
  it('guest nespadne a prihlasovaciu stránku zobrazí', async () => {
    authClient.getSession.mockRejectedValue(new TypeError('fetch failed'));
    await expect(guestMiddleware(route('/prihlasenie'), route('/'))).resolves.toBeUndefined();
    expect(navigate).not.toHaveBeenCalled();
  });

  it('auth nespadne a presmeruje na prihlásenie', async () => {
    authClient.getSession.mockRejectedValue(new TypeError('fetch failed'));
    await authMiddleware(route('/moje-rezervacie'), route('/'));
    expect(navigate).toHaveBeenCalledWith({
      path: '/prihlasenie',
      query: { redirect: '/moje-rezervacie' },
    });
  });

  it('po výpadku sa session pri ďalšej navigácii skúsi načítať znova', async () => {
    authClient.getSession.mockRejectedValueOnce(new TypeError('fetch failed'));
    await guestMiddleware(route('/prihlasenie'), route('/'));
    authClient.getSession.mockResolvedValue({
      data: { user: { id: 'u1', name: 'Ján', email: 'jan@britva.test', role: 'customer' } },
    });
    await guestMiddleware(route('/prihlasenie'), route('/'));
    expect(authClient.getSession).toHaveBeenCalledTimes(2);
    expect(navigate).toHaveBeenCalledWith('/moje-rezervacie');
  });
});
