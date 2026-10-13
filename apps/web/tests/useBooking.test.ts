import { ANY_BARBER } from '@britva/shared';
import { mockNuxtImport } from '@nuxt/test-utils/runtime';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const apiMock = vi.fn();
mockNuxtImport('useApi', () => () => apiMock);

const SERVICE = '1b4e28ba-2fa1-4d3b-a3f5-ef19b5a7633b';
const BARBER = '3d6a4adc-4bc3-4f5d-85b7-a13bd7c9855d';
const SLOT = { startsAt: '2026-10-20T10:00:00.000+02:00', endsAt: '2026-10-20T10:45:00.000+02:00' };

function fillValid(b: ReturnType<typeof useBooking>) {
  b.open({ serviceId: SERVICE, slot: SLOT });
  b.goTo(4);
  b.state.value.name = 'Ján Novák';
  b.state.value.phone = '+421 900 123 456';
}

describe('useBooking', () => {
  beforeEach(() => {
    apiMock.mockReset();
    apiMock.mockResolvedValue(null); // get-session – neprihlásený
    const b = useBooking();
    b.state.value = {
      ...b.state.value,
      isOpen: false,
      name: '',
      phone: '',
      note: '',
      result: null,
    };
  });

  it('open() bez predvoľby začne krokom 1 s barberom „ktokoľvek“', () => {
    const b = useBooking();
    b.open();
    expect(b.state.value).toMatchObject({
      isOpen: true,
      step: 1,
      serviceId: null,
      barberId: ANY_BARBER,
    });
    expect(b.canProceed.value).toBe(false);
  });

  it('open() so službou skočí na barbera, so slotom rovno na termín', () => {
    const b = useBooking();
    b.open({ serviceId: SERVICE });
    expect(b.state.value.step).toBe(2);
    b.open({ serviceId: SERVICE, slot: SLOT });
    expect(b.state.value).toMatchObject({ step: 3, date: '2026-10-20', slot: SLOT });
    expect(b.canProceed.value).toBe(true);
  });

  it('výber služby/barbera posunie krok a zmena výberu zruší zvolený čas', () => {
    const b = useBooking();
    b.open();
    b.selectService(SERVICE);
    expect(b.state.value.step).toBe(2);
    b.selectBarber(BARBER);
    expect(b.state.value.step).toBe(3);
    b.selectSlot(SLOT);
    b.selectDate('2026-10-21');
    expect(b.state.value.slot).toBeNull();
    expect(b.canGoTo(4)).toBe(false);
  });

  it('kontakt: chyby mena a telefónu, odoslanie bez platných údajov nevolá API', async () => {
    const b = useBooking();
    b.open({ serviceId: SERVICE, slot: SLOT });
    b.goTo(4);
    expect(b.contactErrors.value).toHaveProperty('name');
    expect(b.contactErrors.value).toHaveProperty('phone');
    apiMock.mockClear();
    await b.submit();
    expect(apiMock).not.toHaveBeenCalled();
    expect(b.state.value.submitAttempted).toBe(true);
  });

  it('úspešné odoslanie uloží výsledok a pošle údaje na API', async () => {
    const b = useBooking();
    fillValid(b);
    b.state.value.note = '  Iba brada ';
    const details = { id: 'x', code: 'BB-7K3QXM' };
    apiMock.mockResolvedValueOnce(details);
    await b.submit();
    expect(apiMock).toHaveBeenLastCalledWith('/bookings', {
      method: 'POST',
      body: {
        serviceId: SERVICE,
        barberId: ANY_BARBER,
        startsAt: SLOT.startsAt,
        customerName: 'Ján Novák',
        phone: '+421 900 123 456',
        note: 'Iba brada',
      },
    });
    expect(b.state.value.result).toEqual(details);
    expect(b.state.value.submitting).toBe(false);
  });

  it('409: návrat na výber termínu, zrušený slot, obnova slotov a hláška', async () => {
    const b = useBooking();
    fillValid(b);
    const version = b.state.value.slotsVersion;
    apiMock.mockRejectedValueOnce({ statusCode: 409, data: { message: 'obsadené' } });
    await b.submit();
    expect(b.state.value).toMatchObject({ step: 3, slot: null, result: null });
    expect(b.state.value.slotsVersion).toBe(version + 1);
    expect(b.state.value.error).toMatch(/obsadil/);
  });

  it('429 a iné chyby zobrazia správu a ostanú na kroku 4', async () => {
    const b = useBooking();
    fillValid(b);
    apiMock.mockRejectedValueOnce({ statusCode: 429 });
    await b.submit();
    expect(b.state.value.error).toMatch(/Príliš veľa/);
    apiMock.mockRejectedValueOnce({
      statusCode: 500,
      data: { message: 'Nastala neočakávaná chyba.' },
    });
    await b.submit();
    expect(b.state.value).toMatchObject({ step: 4, error: 'Nastala neočakávaná chyba.' });
  });

  it('predvyplní kontakt prihláseného používateľa a po úspechu začne odznova', async () => {
    const b = useBooking();
    apiMock.mockReset();
    apiMock.mockResolvedValueOnce({
      user: { name: 'Peter Hudec', phone: '+421900999888' },
      session: {},
    });
    b.open();
    expect(apiMock).toHaveBeenCalledWith('/auth/get-session');
    await vi.waitFor(() => expect(b.state.value.name).toBe('Peter Hudec'));
    expect(b.state.value.phone).toBe('+421900999888');

    b.state.value.result = { code: 'BB-AAAAAA' } as never;
    b.close();
    expect(b.state.value).toMatchObject({
      isOpen: false,
      result: null,
      step: 1,
      name: 'Peter Hudec',
    });
  });
});
