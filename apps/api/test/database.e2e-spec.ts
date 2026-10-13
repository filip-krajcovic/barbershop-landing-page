import { Pool, type PoolClient } from 'pg';

/**
 * Overuje obmedzenia, ktoré sú iba v databáze (vlastná migrácia 0001).
 * Predpokladá aplikované migrácie (`pnpm db:migrate`). Každý test beží v transakcii,
 * ktorá sa na konci vráti späť, takže databázu nezašpiní.
 */
describe('databázové obmedzenia rezervácií', () => {
  let pool: Pool;
  let client: PoolClient;
  let barberId: string;
  let serviceId: string;

  const insertBooking = (startsAt: string, endsAt: string, status = 'confirmed', code?: string) =>
    client.query(
      `INSERT INTO bookings (code, service_id, barber_id, starts_at, ends_at, customer_name, phone, status)
       VALUES ($1, $2, $3, $4, $5, 'Test', '+421900000000', $6)`,
      [
        code ?? `BB-${Math.random().toString(36).slice(2, 8).toUpperCase()}`,
        serviceId,
        barberId,
        startsAt,
        endsAt,
        status,
      ],
    );

  beforeAll(() => {
    pool = new Pool({ connectionString: process.env.DATABASE_URL });
  });

  afterAll(async () => {
    await pool.end();
  });

  beforeEach(async () => {
    client = await pool.connect();
    await client.query('BEGIN');
    const service = await client.query<{ id: string }>(
      `INSERT INTO services (slug, name, duration_min, price_cents) VALUES ('test-svc', 'Test', 30, 1000) RETURNING id`,
    );
    const barber = await client.query<{ id: string }>(
      `INSERT INTO barbers (slug, name) VALUES ('test-barber', 'Test') RETURNING id`,
    );
    serviceId = service.rows[0]!.id;
    barberId = barber.rows[0]!.id;
  });

  afterEach(async () => {
    await client.query('ROLLBACK');
    client.release();
  });

  it('zamietne prekrývajúce sa aktívne rezervácie jedného barbera', async () => {
    await insertBooking('2030-01-07T09:00:00+01:00', '2030-01-07T09:45:00+01:00');
    await expect(
      insertBooking('2030-01-07T09:30:00+01:00', '2030-01-07T10:00:00+01:00'),
    ).rejects.toMatchObject({ code: '23P01', constraint: 'bookings_no_overlap' });
  });

  it('povolí termíny tesne za sebou', async () => {
    await insertBooking('2030-01-07T09:00:00+01:00', '2030-01-07T09:45:00+01:00');
    await expect(
      insertBooking('2030-01-07T09:45:00+01:00', '2030-01-07T10:15:00+01:00'),
    ).resolves.toBeDefined();
  });

  it('zrušená rezervácia neblokuje termín', async () => {
    await insertBooking('2030-01-07T09:00:00+01:00', '2030-01-07T09:45:00+01:00', 'cancelled');
    await expect(
      insertBooking('2030-01-07T09:00:00+01:00', '2030-01-07T09:45:00+01:00'),
    ).resolves.toBeDefined();
  });

  it('zamietne koniec pred začiatkom', async () => {
    await expect(
      insertBooking('2030-01-07T10:00:00+01:00', '2030-01-07T09:00:00+01:00'),
    ).rejects.toMatchObject({ code: '23514', constraint: 'bookings_ends_after_starts' });
  });

  it('zamietne duplicitný kód rezervácie', async () => {
    await insertBooking(
      '2030-01-08T09:00:00+01:00',
      '2030-01-08T09:30:00+01:00',
      'confirmed',
      'BB-DUP1',
    );
    await expect(
      insertBooking(
        '2030-01-09T09:00:00+01:00',
        '2030-01-09T09:30:00+01:00',
        'confirmed',
        'BB-DUP1',
      ),
    ).rejects.toMatchObject({ code: '23505', constraint: 'bookings_code_unique' });
  });
});
