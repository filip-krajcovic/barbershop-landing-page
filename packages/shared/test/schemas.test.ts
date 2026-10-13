import { randomUUID } from 'node:crypto';
import { describe, expect, it } from 'vitest';
import {
  ANY_BARBER,
  availabilityQuerySchema,
  bookingCodeSchema,
  canCancelBooking,
  createBarberSchema,
  createBookingSchema,
  createServiceSchema,
  nextFreeSlotSchema,
  phoneSchema,
  serviceSchema,
  updateBarberSchema,
  updateServiceSchema,
} from '../src';

const validBooking = {
  serviceId: randomUUID(),
  barberId: randomUUID(),
  startsAt: '2026-10-14T09:00:00+02:00',
  customerName: 'Ján Novák',
  phone: '+421 900 123 456',
};

describe('serviceSchema', () => {
  it('prijme platnú službu', () => {
    const service = {
      id: randomUUID(),
      slug: 'skin-fade',
      name: 'Skin fade',
      description: 'Prechod až do kože.',
      durationMin: 50,
      priceCents: 2500,
    };
    expect(serviceSchema.parse(service)).toEqual(service);
  });

  it('odmietne zápornú cenu a necelé minúty', () => {
    const base = { id: randomUUID(), slug: 'x', name: 'X', description: '' };
    expect(serviceSchema.safeParse({ ...base, durationMin: 30, priceCents: -1 }).success).toBe(
      false,
    );
    expect(serviceSchema.safeParse({ ...base, durationMin: 30.5, priceCents: 0 }).success).toBe(
      false,
    );
  });
});

describe('phoneSchema', () => {
  it('odstráni medzery', () => {
    expect(phoneSchema.parse(' +421 900 123 456 ')).toBe('+421900123456');
    expect(phoneSchema.parse('0900 123 456')).toBe('0900123456');
  });

  it('odmietne krátke čísla, písmená a + v strede', () => {
    expect(phoneSchema.safeParse('12345678').success).toBe(false);
    expect(phoneSchema.safeParse('0900 abc 456').success).toBe(false);
    expect(phoneSchema.safeParse('0900+123456').success).toBe(false);
    expect(phoneSchema.safeParse('+1234567890123456').success).toBe(false);
  });
});

describe('createBookingSchema', () => {
  it('prijme platnú rezerváciu a znormalizuje telefón aj meno', () => {
    const parsed = createBookingSchema.parse({ ...validBooking, customerName: '  Ján Novák ' });
    expect(parsed.phone).toBe('+421900123456');
    expect(parsed.customerName).toBe('Ján Novák');
    expect(parsed.note).toBeUndefined();
  });

  it('prijme barberId "any"', () => {
    expect(createBookingSchema.safeParse({ ...validBooking, barberId: ANY_BARBER }).success).toBe(
      true,
    );
  });

  it('odmietne čas bez offsetu, krátke meno a príliš dlhú poznámku', () => {
    expect(
      createBookingSchema.safeParse({ ...validBooking, startsAt: '2026-10-14T09:00:00' }).success,
    ).toBe(false);
    expect(createBookingSchema.safeParse({ ...validBooking, customerName: ' J ' }).success).toBe(
      false,
    );
    expect(createBookingSchema.safeParse({ ...validBooking, note: 'x'.repeat(501) }).success).toBe(
      false,
    );
  });

  it('odmietne neplatné ID', () => {
    expect(createBookingSchema.safeParse({ ...validBooking, serviceId: '123' }).success).toBe(
      false,
    );
    expect(createBookingSchema.safeParse({ ...validBooking, barberId: 'nobody' }).success).toBe(
      false,
    );
  });
});

describe('availabilityQuerySchema', () => {
  it('vyžaduje dátum YYYY-MM-DD', () => {
    const base = { serviceId: randomUUID(), barberId: ANY_BARBER };
    expect(availabilityQuerySchema.safeParse({ ...base, date: '2026-10-14' }).success).toBe(true);
    expect(availabilityQuerySchema.safeParse({ ...base, date: '14.10.2026' }).success).toBe(false);
    expect(availabilityQuerySchema.safeParse({ ...base, date: '2026-02-30' }).success).toBe(false);
  });
});

describe('nextFreeSlotSchema', () => {
  it('povolí null, keď nie je voľný termín', () => {
    expect(nextFreeSlotSchema.parse(null)).toBeNull();
  });
});

describe('bookingCodeSchema', () => {
  it('kontroluje formát kódu', () => {
    expect(bookingCodeSchema.safeParse('BB-7K3QXM').success).toBe(true);
    expect(bookingCodeSchema.safeParse('BB-12').success).toBe(false);
    expect(bookingCodeSchema.safeParse('bb-7k3qxm').success).toBe(false);
  });
});

describe('canCancelBooking', () => {
  const now = new Date('2026-10-14T08:00:00Z');

  it('povolí zrušenie presne 12 h a viac vopred', () => {
    expect(canCancelBooking(new Date('2026-10-14T20:00:00Z'), now)).toBe(true);
    expect(canCancelBooking(new Date('2026-10-15T08:00:00Z'), now)).toBe(true);
  });

  it('zakáže zrušenie menej ako 12 h vopred', () => {
    expect(canCancelBooking(new Date('2026-10-14T19:59:59Z'), now)).toBe(false);
    expect(canCancelBooking(new Date('2026-10-14T07:00:00Z'), now)).toBe(false);
  });
});

describe('admin schémy služieb a barberov', () => {
  it('createServiceSchema doplní predvolené hodnoty', () => {
    expect(
      createServiceSchema.parse({ slug: 'novy', name: 'Nový', durationMin: 30, priceCents: 1000 }),
    ).toMatchObject({ description: '', sortOrder: 0, active: true });
  });

  it('updateServiceSchema nedoplní predvolené hodnoty (PATCH nič neprepíše)', () => {
    expect(updateServiceSchema.parse({ priceCents: 1500 })).toEqual({ priceCents: 1500 });
    expect(updateBarberSchema.parse({ name: 'Ján' })).toEqual({ name: 'Ján' });
  });

  it('prázdny PATCH je neplatný', () => {
    expect(updateServiceSchema.safeParse({}).success).toBe(false);
    expect(updateBarberSchema.safeParse({}).success).toBe(false);
  });

  it('slug musí byť URL-friendly', () => {
    const base = { name: 'X', durationMin: 30, priceCents: 0 };
    expect(createServiceSchema.safeParse({ ...base, slug: 'Skin Fade' }).success).toBe(false);
    expect(createServiceSchema.safeParse({ ...base, slug: '-fade' }).success).toBe(false);
    expect(createServiceSchema.safeParse({ ...base, slug: 'skin-fade-2' }).success).toBe(true);
  });

  it('createBarberSchema má prázdny zoznam služieb a avatar null', () => {
    expect(createBarberSchema.parse({ slug: 'jan', name: 'Ján' })).toMatchObject({
      serviceIds: [],
      avatarUrl: null,
      active: true,
    });
  });
});
