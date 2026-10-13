import { randomUUID } from 'node:crypto';
import { barberSchema, type Barber } from '@britva/shared';
import type { NestExpressApplication } from '@nestjs/platform-express';
import request from 'supertest';
import { createTestApp } from './create-app.js';
import { cleanupTestData, signInAs, uniqueSlug } from './helpers.js';

describe('barberi (e2e)', () => {
  let app: NestExpressApplication;
  let admin: string[];
  let serviceId: string;
  const http = () => request(app.getHttpServer());
  const ids = (list: Barber[]) => list.map((b) => b.id);

  const createBarber = (body: Record<string, unknown>) =>
    http()
      .post('/api/barbers')
      .set('Cookie', admin)
      .send({ slug: uniqueSlug('barber'), name: 'Test Barber', ...body });

  beforeAll(async () => {
    app = await createTestApp();
    admin = await signInAs(app, 'admin');
    const service = await http()
      .post('/api/services')
      .set('Cookie', admin)
      .send({ slug: uniqueSlug('svc'), name: 'Fade', durationMin: 50, priceCents: 2500 })
      .expect(201);
    serviceId = service.body.id;
  });

  afterAll(async () => {
    await cleanupTestData(app);
    await app.close();
  });

  it('GET /api/barbers je verejné a vracia barberov podľa schémy', async () => {
    const res = await http().get('/api/barbers').expect(200);
    for (const item of res.body) {
      expect(barberSchema.safeParse(item).success).toBe(true);
    }
  });

  it('filter podľa služby vráti iba barberov, ktorí ju robia', async () => {
    const withService = (await createBarber({ serviceIds: [serviceId] }).expect(201))
      .body as Barber;
    const without = (await createBarber({}).expect(201)).body as Barber;

    const filtered = (await http().get(`/api/barbers?serviceId=${serviceId}`).expect(200))
      .body as Barber[];
    expect(ids(filtered)).toContain(withService.id);
    expect(ids(filtered)).not.toContain(without.id);

    const all = (await http().get('/api/barbers').expect(200)).body as Barber[];
    expect(ids(all)).toEqual(expect.arrayContaining([withService.id, without.id]));
  });

  it('úprava serviceIds nahradí zoznam služieb', async () => {
    const barber = (await createBarber({ serviceIds: [serviceId] }).expect(201)).body as Barber;
    const patched = await http()
      .patch(`/api/barbers/${barber.id}`)
      .set('Cookie', admin)
      .send({ serviceIds: [] })
      .expect(200);
    expect(patched.body).toEqual(barber);

    const filtered = (await http().get(`/api/barbers?serviceId=${serviceId}`).expect(200))
      .body as Barber[];
    expect(ids(filtered)).not.toContain(barber.id);
  });

  it('deaktivovaný barber zmizne zo zoznamu', async () => {
    const barber = (await createBarber({}).expect(201)).body as Barber;
    await http().delete(`/api/barbers/${barber.id}`).set('Cookie', admin).expect(204);
    const all = (await http().get('/api/barbers').expect(200)).body as Barber[];
    expect(ids(all)).not.toContain(barber.id);
  });

  it('chyby: neznáma služba 400, duplicitný slug 409, neplatný filter 400, bez admina 401', async () => {
    await createBarber({ serviceIds: [randomUUID()] }).expect(400);

    const slug = uniqueSlug('dup');
    await createBarber({ slug }).expect(201);
    await createBarber({ slug }).expect(409);

    await http().get('/api/barbers?serviceId=abc').expect(400);
    await http()
      .post('/api/barbers')
      .send({ slug: uniqueSlug('x'), name: 'X' })
      .expect(401);
  });
});
