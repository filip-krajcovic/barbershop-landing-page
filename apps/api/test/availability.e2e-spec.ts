import { randomUUID } from 'node:crypto';
import { availabilityResponseSchema, nextFreeSlotResponseSchema, type Slot } from '@britva/shared';
import type { NestExpressApplication } from '@nestjs/platform-express';
import type { Pool } from 'pg';
import request from 'supertest';
import { addDays, todayIn, weekdayOf, zonedTime } from '../src/availability/local-date.js';
import { createTestApp } from './create-app.js';
import { cleanupTestData, getPool, uniqueSlug } from './helpers.js';

/** Najbližší pracovný deň (po–pi) aspoň 2 dni od dnes – sloty nie sú ovplyvnené aktuálnym časom. */
function nextWorkday(): string {
  let date = addDays(todayIn(new Date()), 2);
  while ([0, 6].includes(weekdayOf(date))) date = addDays(date, 1);
  return date;
}

describe('dostupnosť termínov (e2e)', () => {
  let app: NestExpressApplication;
  let pool: Pool;
  let serviceId: string;
  let lonelyServiceId: string;
  let barberA: string;
  let barberB: string;
  const date = nextWorkday();
  const http = () => request(app.getHttpServer());

  const insert = async (sql: string, params: unknown[]) =>
    (await pool.query<{ id: string }>(sql, params)).rows[0]!.id;
  const local = (iso: string) => iso.slice(11, 16);
  const slotAt = (slots: Slot[], hhmm: string) => slots.find((s) => local(s.startsAt) === hhmm);
  const day = async (barberId: string, d = date) => {
    const res = await http()
      .get('/api/availability')
      .query({ serviceId, barberId, date: d })
      .expect(200);
    return availabilityResponseSchema.parse(res.body).slots;
  };
  const book = (barberId: string, from: number, to: number, status = 'confirmed') =>
    pool.query(
      `INSERT INTO bookings (code, service_id, barber_id, starts_at, ends_at, customer_name, phone, status)
       VALUES ($1, $2, $3, $4, $5, 'Test', '+421900000000', $6)`,
      [
        `BB-${randomUUID().slice(0, 6).toUpperCase()}`,
        serviceId,
        barberId,
        zonedTime(date, from),
        zonedTime(date, to),
        status,
      ],
    );

  beforeAll(async () => {
    app = await createTestApp();
    pool = getPool(app);
    serviceId = await insert(
      `INSERT INTO services (slug, name, duration_min, price_cents) VALUES ($1, 'Strih', 45, 2200) RETURNING id`,
      [uniqueSlug('svc')],
    );
    lonelyServiceId = await insert(
      `INSERT INTO services (slug, name, duration_min, price_cents) VALUES ($1, 'Nikto', 30, 1000) RETURNING id`,
      [uniqueSlug('svc')],
    );
    barberA = await insert(
      `INSERT INTO barbers (slug, name, sort_order) VALUES ($1, 'A', 0) RETURNING id`,
      [uniqueSlug('a')],
    );
    barberB = await insert(
      `INSERT INTO barbers (slug, name, sort_order) VALUES ($1, 'B', 1) RETURNING id`,
      [uniqueSlug('b')],
    );
    await pool.query(`INSERT INTO barber_services VALUES ($1, $3), ($2, $3)`, [
      barberA,
      barberB,
      serviceId,
    ]);
    // A: po–pi 9–19, B: po–pi 9–12
    for (const weekday of [1, 2, 3, 4, 5]) {
      await pool.query(
        `INSERT INTO working_hours (barber_id, weekday, opens_at, closes_at) VALUES ($1, $3, '09:00', '19:00'), ($2, $3, '09:00', '12:00')`,
        [barberA, barberB, weekday],
      );
    }
    await book(barberA, 10 * 60, 10 * 60 + 45);
  });

  afterAll(async () => {
    await cleanupTestData(app);
    await app.close();
  });

  it('konkrétny barber: rezervácia blokuje prekrývajúce sa sloty', async () => {
    const slots = await day(barberA);
    expect(local(slots[0]!.startsAt)).toBe('09:00');
    expect(local(slots.at(-1)!.startsAt)).toBe('18:00');
    expect(slotAt(slots, '09:00')!.available).toBe(true); // 9:00–9:45 končí pred 10:00
    expect(slotAt(slots, '09:30')!.available).toBe(false); // 9:30–10:15
    expect(slotAt(slots, '10:00')!.available).toBe(false);
    expect(slotAt(slots, '10:30')!.available).toBe(false); // 10:30–11:15 vs. do 10:45
    expect(slotAt(slots, '11:00')!.available).toBe(true);
  });

  it('ktokoľvek: slot je voľný, ak je voľný iný barber; B nepracuje po 12:00', async () => {
    const slots = await day('any');
    expect(slotAt(slots, '10:00')!.available).toBe(true); // B je voľný
    const onlyB = await day(barberB);
    expect(local(onlyB.at(-1)!.startsAt)).toBe('11:00'); // 11:00–11:45, 11:30 by končila 12:15
  });

  it('voľno barbera blokuje sloty, zrušená rezervácia nie', async () => {
    await pool.query(`INSERT INTO time_off (barber_id, starts_at, ends_at) VALUES ($1, $2, $3)`, [
      barberB,
      zonedTime(date, 9 * 60),
      zonedTime(date, 12 * 60),
    ]);
    await book(barberA, 15 * 60, 16 * 60, 'cancelled');

    const slots = await day('any');
    expect(slotAt(slots, '10:00')!.available).toBe(false); // A má rezerváciu, B voľno
    expect(slotAt(slots, '15:00')!.available).toBe(true); // zrušená rezervácia neblokuje
  });

  it('nedeľa, minulosť a dátum za horizontom nemajú sloty', async () => {
    let sunday = date;
    while (weekdayOf(sunday) !== 0) sunday = addDays(sunday, 1);
    expect(await day('any', sunday)).toEqual([]);
    expect(await day('any', addDays(todayIn(new Date()), -1))).toEqual([]);
    expect(await day('any', addDays(todayIn(new Date()), 15))).toEqual([]);
  });

  it('chyby: neplatný dotaz 400, neznáma služba 404, barber bez služby 404', async () => {
    await http()
      .get('/api/availability')
      .query({ serviceId, barberId: 'any', date: '14.10.2026' })
      .expect(400);
    await http()
      .get('/api/availability')
      .query({ serviceId: randomUUID(), barberId: 'any', date })
      .expect(404);
    await http()
      .get('/api/availability')
      .query({ serviceId: lonelyServiceId, barberId: barberA, date })
      .expect(404);
  });

  it('next-free vráti najbližší voľný termín, alebo null ak službu nikto nerobí', async () => {
    const res = await http().get('/api/availability/next-free').query({ serviceId }).expect(200);
    const next = nextFreeSlotResponseSchema.parse(res.body).slot;
    expect(next).not.toBeNull();
    expect([barberA, barberB]).toContain(next!.barberId);
    expect(new Date(next!.startsAt).getTime()).toBeGreaterThan(Date.now() + 29 * 60_000);
    expect(new Date(next!.endsAt).getTime() - new Date(next!.startsAt).getTime()).toBe(45 * 60_000);

    const none = await http()
      .get('/api/availability/next-free')
      .query({ serviceId: lonelyServiceId })
      .expect(200);
    expect(none.headers['content-type']).toMatch(/application\/json/);
    expect(none.body).toEqual({ slot: null });
  });
});
