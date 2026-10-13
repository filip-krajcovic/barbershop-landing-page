import type { BookingDetails } from '@britva/shared';
import { mockNuxtImport, mountSuspended } from '@nuxt/test-utils/runtime';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { computed, ref } from 'vue';
import { clearNuxtData } from '#imports';
import MyBookings from '~/pages/moje-rezervacie.vue';
import Login from '~/pages/prihlasenie.vue';

const { signIn, navigate, apiMock } = vi.hoisted(() => ({
  signIn: vi.fn(),
  navigate: vi.fn(),
  apiMock: vi.fn(),
}));

mockNuxtImport('useAuth', () => () => {
  const user = ref({
    id: 'u1',
    name: 'Ján Novák',
    email: 'jan@britva.test',
    role: 'customer',
    phone: null,
  });
  return {
    user,
    loaded: ref(true),
    loggedIn: computed(() => true),
    signIn,
    signOut: vi.fn(),
    refresh: vi.fn(),
  };
});
mockNuxtImport('navigateTo', () => navigate);
mockNuxtImport('useApi', () => () => apiMock);

const hours = (h: number) => new Date(Date.now() + h * 3600_000).toISOString();
const booking = (overrides: Partial<BookingDetails>): BookingDetails => ({
  id: crypto.randomUUID(),
  code: 'BB-AAAAAA',
  status: 'confirmed',
  serviceId: crypto.randomUUID(),
  barberId: crypto.randomUUID(),
  startsAt: hours(48),
  endsAt: hours(48.75),
  customerName: 'Ján Novák',
  phone: '+421900123456',
  note: null,
  createdAt: hours(-24),
  service: { name: 'Pánsky strih', priceCents: 2200 },
  barber: { name: 'Marek' },
  ...overrides,
});

beforeEach(() => {
  clearNuxtData();
  signIn.mockReset();
  navigate.mockReset();
  apiMock.mockReset();
});

describe('Prihlásenie', () => {
  it('prihlási a presmeruje na bezpečný cieľ', async () => {
    signIn.mockResolvedValue(undefined);
    const wrapper = await mountSuspended(Login, { route: '/prihlasenie?redirect=https://zla.sk' });
    const inputs = wrapper.findAll('input');
    await inputs[0]!.setValue(' jan@britva.test ');
    await inputs[1]!.setValue('spravne-heslo');
    await wrapper.get('form').trigger('submit');
    await vi.waitFor(() => expect(navigate).toHaveBeenCalledWith('/moje-rezervacie'));
    expect(signIn).toHaveBeenCalledWith('jan@britva.test', 'spravne-heslo');
  });

  it('zobrazí chybu z better-auth', async () => {
    const { AuthError } = await import('~/composables/useAuth');
    signIn.mockRejectedValue(new AuthError('Nesprávny e-mail alebo heslo.'));
    const wrapper = await mountSuspended(Login);
    const inputs = wrapper.findAll('input');
    await inputs[0]!.setValue('jan@britva.test');
    await inputs[1]!.setValue('zle');
    await wrapper.get('form').trigger('submit');
    await vi.waitFor(() =>
      expect(wrapper.find('[role="alert"]').text()).toBe('Nesprávny e-mail alebo heslo.'),
    );
    expect(navigate).not.toHaveBeenCalled();
  });
});

describe('Moje rezervácie', () => {
  it('rozdelí nadchádzajúce a históriu, zrušenie iba viac ako 12 h vopred', async () => {
    apiMock.mockResolvedValue([
      booking({ code: 'BB-LATER1', startsAt: hours(48), endsAt: hours(48.75) }),
      booking({ code: 'BB-SOON11', startsAt: hours(3), endsAt: hours(3.75) }),
      booking({ code: 'BB-CANCEL', status: 'cancelled' }),
      booking({ code: 'BB-PAST11', startsAt: hours(-48), endsAt: hours(-47.25) }),
    ]);
    const wrapper = await mountSuspended(MyBookings);
    await vi.waitFor(() => expect(wrapper.findAll('[data-booking]')).toHaveLength(4));

    const later = wrapper.get('[data-booking="BB-LATER1"]');
    expect(later.text()).toContain('Zrušiť rezerváciu');
    const soon = wrapper.get('[data-booking="BB-SOON11"]');
    expect(soon.text()).toContain('menej ako 12 hodín');
    expect(soon.text()).not.toContain('Zrušiť rezerváciu');
    expect(wrapper.get('[data-booking="BB-CANCEL"]').text()).toContain('Zrušená');
    expect(wrapper.get('[data-booking="BB-PAST11"]').text()).toContain('Prebehla');
    expect(wrapper.text()).toContain('Ahoj, Ján');
  });

  it('zrušenie s potvrdením zavolá API a obnoví zoznam', async () => {
    const item = booking({ code: 'BB-LATER2' });
    apiMock
      .mockResolvedValueOnce([item])
      .mockResolvedValueOnce(undefined)
      .mockResolvedValueOnce([{ ...item, status: 'cancelled' }]);
    const wrapper = await mountSuspended(MyBookings);
    await vi.waitFor(() => expect(wrapper.find('[data-booking="BB-LATER2"]').exists()).toBe(true));

    const button = () => wrapper.get('[data-booking="BB-LATER2"]').findAll('button');
    await button()[0]!.trigger('click'); // Zrušiť rezerváciu
    expect(wrapper.text()).toContain('Naozaj zrušiť?');
    await button()[0]!.trigger('click'); // Áno, zrušiť
    await vi.waitFor(() =>
      expect(apiMock).toHaveBeenCalledWith(`/bookings/${item.id}/cancel`, { method: 'PATCH' }),
    );
    await vi.waitFor(() =>
      expect(wrapper.get('[data-booking="BB-LATER2"]').text()).toContain('Zrušená'),
    );
  });
});
