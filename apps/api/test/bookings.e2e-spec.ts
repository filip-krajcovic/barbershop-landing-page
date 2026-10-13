import { randomUUID } from 'node:crypto';
import { bookingCodeSchema, bookingDetailsSchema, type BookingDetails } from '@britva/shared';
import type { NestExpressApplication } from '@nestjs/platform-express';
import type { Pool } from 'pg';
import request from 'supertest';
import { toZonedIso, zonedTime } from '../src/availability/local-date.js';
import { RemindersService } from '../src/notifications/reminders.service.js';
import { SMS_SENDER } from '../src/notifications/sms.service.js';
import { createTestApp } from './create-app.js';
import { cleanupTestData, getPool, nextWorkday, signInAs, uniqueSlug } from './helpers.js';

describe('rezervácie (e2e)', () => {
  let app: NestExpressApplication;
  let pool: Pool;
  let serviceId: string;
  let barberA: string;
  let barberB: string;
  let customer: string[];
  let otherCustomer: string[];
  let admin: string[];
  const sms = { send: vi.fn().mockResolvedValue(undefined) };
  const date = nextWorkday();
  const http = () => request(app.getHttpServer());

  /** ISO čas s offsetom prevádzky pre `date` a `hh:mm`. */
  const at = (hhmm: string) => {
    const [h, m] = hhmm.split(':').map(Number) as [number, number];
    return toZonedIso(zonedTime(date, h * 60 + m));
  };
  const body = (overrides: Record<string, unknown> = {}) => ({
    serviceId,
    barberId: 'any',
    startsAt: at('10:00'),
    customerName: 'Ján Novák',
    phone: '+421 900 123 456',
    ...overrides,
  });
  const insert = async (sql: string, params: unknown[]) =>
    (await pool.query<{ id: string }>(sql, params)).rows[0]!.id;

  beforeAll(async () => {
    app = await createTestApp((b) => b.overrideProvider(SMS_SENDER).useValue(sms));
    pool = getPool(app);
    serviceId = await insert(
      `INSERT INTO services (slug, name, duration_min, price_cents) VALUES ($1, 'Pánsky strih', 45, 2200) RETURNING id`,
      [uniqueSlug('svc')],
    );
    barberA = await insert(
      `INSERT INTO barbers (slug, name, sort_order) VALUES ($1, 'Marek', 0) RETURNING id`,
      [uniqueSlug('a')],
    );
    barberB = await insert(
      `INSERT INTO barbers (slug, name, sort_order) VALUES ($1, 'Tomáš', 1) RETURNING id`,
      [uniqueSlug('b')],
    );
    await pool.query(`INSERT INTO barber_services VALUES ($1, $3), ($2, $3)`, [
      barberA,
      barberB,
      serviceId,
    ]);
    for (const weekday of [1, 2, 3, 4, 5]) {
      await pool.query(
        `INSERT INTO working_hours (barber_id, weekday, opens_at, closes_at) VALUES ($1, $3, '09:00', '19:00'), ($2, $3, '09:00', '19:00')`,
        [barberA, barberB, weekday],
      );
    }
    customer = await signInAs(app, 'customer');
    otherCustomer = await signInAs(app, 'customer');
    admin = await signInAs(app, 'admin');
  });

  afterAll(async () => {
    await cleanupTestData(app);
    await app.close();
  });

  beforeEach(() => sms.send.mockClear());

  it('hosť: „ktokoľvek“ priradí barberov v poradí, tretí na rovnaký čas dostane 409', async () => {
    const first = await http().post('/api/bookings').send(body()).expect(201);
    const booking = bookingDetailsSchema.parse(first.body);
    expect(booking).toMatchObject({
      barberId: barberA,
      status: 'confirmed',
      phone: '+421900123456',
      startsAt: at('10:00'),
      endsAt: at('10:45'),
      service: { name: 'Pánsky strih', priceCents: 2200 },
      barber: { name: 'Marek' },
    });
    expect(bookingCodeSchema.safeParse(booking.code).success).toBe(true);
    expect(sms.send).toHaveBeenCalledWith('+421900123456', expect.stringContaining(booking.code));

    const second = await http().post('/api/bookings').send(body()).expect(201);
    expect(second.body.barberId).toBe(barberB);

    const third = await http().post('/api/bookings').send(body()).expect(409);
    expect(third.body.message).toMatch(/nie je voľný/);
    await http()
      .post('/api/bookings')
      .send(body({ barberId: barberA, startsAt: at('10:30') }))
      .expect(409);
  });

  it('súbežné rezervácie toho istého termínu: uspejú presne dve (2 barberi)', async () => {
    const results = await Promise.all(
      Array.from({ length: 6 }, () =>
        http()
          .post('/api/bookings')
          .send(body({ startsAt: at('14:00') })),
      ),
    );
    const statuses = results.map((r) => r.status).sort();
    expect(statuses).toEqual([201, 201, 409, 409, 409, 409]);
    const barbersBooked = results.filter((r) => r.status === 201).map((r) => r.body.barberId);
    expect(new Set(barbersBooked)).toEqual(new Set([barberA, barberB]));
  });

  it('neplatný čas: mimo mriežky, v minulosti, mimo otváracích hodín → 409', async () => {
    await http()
      .post('/api/bookings')
      .send(body({ startsAt: at('11:15') }))
      .expect(409);
    await http()
      .post('/api/bookings')
      .send(body({ startsAt: '2020-01-06T10:00:00+01:00' }))
      .expect(409);
    await http()
      .post('/api/bookings')
      .send(body({ startsAt: at('18:30') }))
      .expect(409); // 18:30 + 45 min > 19:00
  });

  it('validácia a neznáma služba', async () => {
    const res = await http()
      .post('/api/bookings')
      .send({ serviceId, customerName: 'J' })
      .expect(400);
    expect(res.body.errors.map((e: { path: string }) => e.path)).toEqual(
      expect.arrayContaining(['barberId', 'startsAt', 'customerName', 'phone']),
    );
    await http()
      .post('/api/bookings')
      .send(body({ serviceId: randomUUID() }))
      .expect(404);
  });

  it('prihlásený zákazník: rezervácia patrí jemu, vidí ju v /me a môže ju zrušiť', async () => {
    const created = await http()
      .post('/api/bookings')
      .set('Cookie', customer)
      .send(body({ startsAt: at('16:00'), note: 'Iba brada' }))
      .expect(201);
    const id = created.body.id as string;

    const mine = (await http().get('/api/bookings/me').set('Cookie', customer).expect(200))
      .body as BookingDetails[];
    expect(mine.map((b) => b.id)).toContain(id);
    expect(mine.find((b) => b.id === id)!.note).toBe('Iba brada');
    const others = (await http().get('/api/bookings/me').set('Cookie', otherCustomer).expect(200))
      .body as BookingDetails[];
    expect(others.map((b) => b.id)).not.toContain(id);

    await http().patch(`/api/bookings/${id}/cancel`).set('Cookie', otherCustomer).expect(404);
    const cancelled = await http()
      .patch(`/api/bookings/${id}/cancel`)
      .set('Cookie', customer)
      .expect(200);
    expect(cancelled.body.status).toBe('cancelled');
    await http().patch(`/api/bookings/${id}/cancel`).set('Cookie', customer).expect(409);

    // zrušený termín je znova voľný
    await http()
      .post('/api/bookings')
      .send(body({ barberId: created.body.barberId, startsAt: at('16:00') }))
      .expect(201);
  });

  it('zrušenie menej ako 12 h vopred: zákazník 409, admin môže', async () => {
    const userId = (await http().get('/api/me').set('Cookie', customer).expect(200)).body.id;
    const startsAt = new Date(Date.now() + 3 * 3600_000);
    const id = await insert(
      `INSERT INTO bookings (code, user_id, service_id, barber_id, starts_at, ends_at, customer_name, phone)
       VALUES ($1, $2, $3, $4, $5, $6, 'Ján', '+421900123456') RETURNING id`,
      [
        `BB-${randomUUID().slice(0, 6).toUpperCase()}`,
        userId,
        serviceId,
        barberA,
        startsAt,
        new Date(startsAt.getTime() + 45 * 60_000),
      ],
    );
    const res = await http()
      .patch(`/api/bookings/${id}/cancel`)
      .set('Cookie', customer)
      .expect(409);
    expect(res.body.message).toMatch(/12 hodín/);
    await http().patch(`/api/bookings/${id}/cancel`).set('Cookie', admin).expect(200);
  });

  it('admin zoznam podľa dňa a barbera; zákazník 403, hosť 401', async () => {
    const list = (
      await http()
        .get('/api/bookings')
        .query({ date, barberId: barberB })
        .set('Cookie', admin)
        .expect(200)
    ).body as BookingDetails[];
    expect(list.length).toBeGreaterThan(0);
    expect(list.every((b) => b.barberId === barberB && b.startsAt.startsWith(date))).toBe(true);
    const times = list.map((b) => b.startsAt);
    expect(times).toEqual([...times].sort());

    await http().get('/api/bookings').set('Cookie', customer).expect(403);
    await http().get('/api/bookings').expect(401);
    await http().get('/api/bookings/me').expect(401);
  });

  it('pripomienky: iba rezervácie vytvorené > 24 h vopred, každá raz', async () => {
    const reminders = app.get(RemindersService);
    const now = new Date();
    const startsAt = new Date(now.getTime() + 20 * 3600_000);
    const endsAt = new Date(startsAt.getTime() + 45 * 60_000);
    const insertBooking = (code: string, barberId: string, createdAt: Date) =>
      pool.query(
        `INSERT INTO bookings (code, service_id, barber_id, starts_at, ends_at, customer_name, phone, created_at)
         VALUES ($1, $2, $3, $4, $5, 'Ján', '+421900999888', $6)`,
        [code, serviceId, barberId, startsAt, endsAt, createdAt],
      );
    const early = `BB-R${randomUUID().slice(0, 5).toUpperCase()}`;
    const late = `BB-L${randomUUID().slice(0, 5).toUpperCase()}`;
    await insertBooking(early, barberA, new Date(now.getTime() - 3 * 24 * 3600_000));
    await insertBooking(late, barberB, new Date(now.getTime() - 3600_000));

    await reminders.sendDueReminders(now);
    const texts = sms.send.mock.calls.map((c) => c[1] as string);
    expect(texts.some((t) => t.includes(early) && t.includes('pripomíname'))).toBe(true);
    expect(texts.some((t) => t.includes(late))).toBe(false);

    sms.send.mockClear();
    await reminders.sendDueReminders(now);
    expect(sms.send.mock.calls.some((c) => (c[1] as string).includes(early))).toBe(false);
  });

  it('zlyhanie SMS nezhodí rezerváciu', async () => {
    sms.send.mockRejectedValueOnce(new Error('SMS brána nedostupná'));
    await http()
      .post('/api/bookings')
      .send(body({ startsAt: at('17:00') }))
      .expect(201);
  });
});
