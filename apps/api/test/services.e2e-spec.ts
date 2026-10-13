import { randomUUID } from 'node:crypto';
import { serviceSchema, type Service } from '@britva/shared';
import type { NestExpressApplication } from '@nestjs/platform-express';
import request from 'supertest';
import { createTestApp } from './create-app.js';
import { cleanupTestData, signInAs, uniqueSlug } from './helpers.js';

describe('služby (e2e)', () => {
  let app: NestExpressApplication;
  let admin: string[];
  let customer: string[];
  const http = () => request(app.getHttpServer());

  const newService = () => ({
    slug: uniqueSlug('svc'),
    name: 'Testovací strih',
    description: 'Popis',
    durationMin: 45,
    priceCents: 2200,
  });

  beforeAll(async () => {
    app = await createTestApp();
    admin = await signInAs(app, 'admin');
    customer = await signInAs(app, 'customer');
  });

  afterAll(async () => {
    await cleanupTestData(app);
    await app.close();
  });

  it('GET /api/services je verejné a vracia služby podľa schémy', async () => {
    const res = await http().get('/api/services').expect(200);
    expect(Array.isArray(res.body)).toBe(true);
    for (const item of res.body) {
      expect(serviceSchema.safeParse(item).success).toBe(true);
    }
  });

  it('vytvorenie vyžaduje admina (401 / 403)', async () => {
    await http().post('/api/services').send(newService()).expect(401);
    await http().post('/api/services').set('Cookie', customer).send(newService()).expect(403);
  });

  it('neplatné telo vráti 400 so zoznamom chýb', async () => {
    const res = await http()
      .post('/api/services')
      .set('Cookie', admin)
      .send({ slug: 'Zlý Slug', durationMin: 0 })
      .expect(400);
    expect(res.body.errors.map((e: { path: string }) => e.path)).toEqual(
      expect.arrayContaining(['slug', 'name', 'durationMin', 'priceCents']),
    );
  });

  it('admin vytvorí, upraví a deaktivuje službu', async () => {
    const input = newService();
    const created = await http().post('/api/services').set('Cookie', admin).send(input).expect(201);
    const service = created.body as Service;
    expect(service).toMatchObject({ ...input, id: expect.any(String) });

    let list = (await http().get('/api/services').expect(200)).body as Service[];
    expect(list.map((s) => s.id)).toContain(service.id);

    await http().post('/api/services').set('Cookie', admin).send(input).expect(409);

    const patched = await http()
      .patch(`/api/services/${service.id}`)
      .set('Cookie', admin)
      .send({ priceCents: 2500 })
      .expect(200);
    // PATCH zmení iba poslané pole
    expect(patched.body).toEqual({ ...service, priceCents: 2500 });

    await http().delete(`/api/services/${service.id}`).set('Cookie', admin).expect(204);
    list = (await http().get('/api/services').expect(200)).body as Service[];
    expect(list.map((s) => s.id)).not.toContain(service.id);
  });

  it('PATCH/DELETE: neplatné ID 400, neexistujúce 404, prázdne telo 400', async () => {
    await http().patch('/api/services/123').set('Cookie', admin).send({ name: 'X' }).expect(400);
    await http()
      .patch(`/api/services/${randomUUID()}`)
      .set('Cookie', admin)
      .send({ name: 'X' })
      .expect(404);
    await http().delete(`/api/services/${randomUUID()}`).set('Cookie', admin).expect(404);

    const created = await http()
      .post('/api/services')
      .set('Cookie', admin)
      .send(newService())
      .expect(201);
    await http()
      .patch(`/api/services/${created.body.id}`)
      .set('Cookie', admin)
      .send({})
      .expect(400);
  });
});
