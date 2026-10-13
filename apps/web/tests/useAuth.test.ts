import { mockNuxtImport } from '@nuxt/test-utils/runtime';
import { describe, expect, it, vi } from 'vitest';

const { authClient } = vi.hoisted(() => ({
  authClient: {
    getSession: vi.fn(),
    signIn: { email: vi.fn() },
    signUp: { email: vi.fn() },
    signOut: vi.fn(),
  },
}));

mockNuxtImport('useAuthClient', () => () => authClient);

const sessionUser = {
  id: 'u1',
  name: 'Ján Novák',
  email: 'jan@britva.test',
  role: 'customer',
  phone: '+421900123456',
};

describe('useAuth', () => {
  it('refresh načíta prihláseného používateľa, signIn s chybou vyhodí AuthError', async () => {
    authClient.getSession.mockResolvedValue({ data: { user: sessionUser } });
    const auth = useAuth();
    await auth.refresh();
    expect(auth.user.value).toMatchObject({
      name: 'Ján Novák',
      role: 'customer',
      phone: '+421900123456',
    });
    expect(auth.loggedIn.value).toBe(true);

    authClient.signIn.email.mockResolvedValue({
      error: { code: 'INVALID_EMAIL_OR_PASSWORD', status: 401 },
    });
    await expect(auth.signIn('jan@britva.test', 'zle')).rejects.toThrow(
      'Nesprávny e-mail alebo heslo.',
    );
  });

  it('signOut odhlási a resetuje (nie zmaže) rozpracovanú rezerváciu', async () => {
    authClient.getSession.mockResolvedValue({ data: { user: sessionUser } });
    authClient.signOut.mockResolvedValue({});
    const auth = useAuth();
    await auth.refresh();
    const booking = useBooking();
    booking.state.value.name = 'Ján Novák';
    booking.state.value.phone = '+421900123456';
    booking.state.value.isOpen = true;

    await auth.signOut();
    expect(auth.user.value).toBeNull();
    // stav musí ostať objekt – dialóg ho sleduje (regresia: clearNuxtState ho nastavil na undefined)
    expect(booking.state.value).toMatchObject({ isOpen: false, name: '', phone: '', step: 1 });
  });
});
