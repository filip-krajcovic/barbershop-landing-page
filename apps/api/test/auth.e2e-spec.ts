import { randomUUID } from 'node:crypto';
import type { NestExpressApplication } from '@nestjs/platform-express';
import request from 'supertest';
import { createTestApp } from './create-app.js';

const ORIGIN = 'http://localhost:3000';

describe('autentifikácia (e2e)', () => {
  let app: NestExpressApplication;
  const email = `test-${randomUUID()}@britva.test`;
  const password = 'spravne-heslo-123';

  const http = () => request(app.getHttpServer());
  const cookieFrom = (res: request.Response): string[] => {
    const raw = res.headers['set-cookie'] as unknown as string[] | undefined;
    expect(raw?.length).toBeGreaterThan(0);
    return raw!.map((c) => c.split(';')[0]!);
  };

  beforeAll(async () => {
    app = await createTestApp();
  });

  afterAll(async () => {
    await app.close();
  });

  it('GET /api/me bez prihlásenia vráti 401', async () => {
    const res = await http().get('/api/me').expect(401);
    expect(res.body).toMatchObject({ statusCode: 401 });
  });

  it('registrácia ignoruje rolu poslanú klientom a nastaví customer', async () => {
    const res = await http()
      .post('/api/auth/sign-up/email')
      .set('Origin', ORIGIN)
      .send({ name: 'Test Zákazník', email, password, role: 'admin' })
      .expect(200);
    expect(res.body.user.role).toBe('customer');
    const me = await http().get('/api/me').set('Cookie', cookieFrom(res)).expect(200);
    expect(me.body.role).toBe('customer');
  });

  it('registrácia, prihlásenie, /api/me a odhlásenie', async () => {
    const signUpEmail = `test-${randomUUID()}@britva.test`;
    const signUp = await http()
      .post('/api/auth/sign-up/email')
      .set('Origin', ORIGIN)
      .send({ name: 'Ján Novák', email: signUpEmail, password, phone: '+421900123456' })
      .expect(200);
    expect(signUp.body.user).toMatchObject({ email: signUpEmail, role: 'customer' });

    await http()
      .post('/api/auth/sign-in/email')
      .set('Origin', ORIGIN)
      .send({ email: signUpEmail, password: 'zle-heslo-123' })
      .expect(401);

    const signIn = await http()
      .post('/api/auth/sign-in/email')
      .set('Origin', ORIGIN)
      .send({ email: signUpEmail, password })
      .expect(200);
    const cookie = cookieFrom(signIn);

    const me = await http().get('/api/me').set('Cookie', cookie).expect(200);
    expect(me.body).toEqual({
      id: expect.any(String),
      name: 'Ján Novák',
      email: signUpEmail,
      role: 'customer',
      phone: '+421900123456',
    });

    await http().post('/api/auth/sign-out').set('Origin', ORIGIN).set('Cookie', cookie).expect(200);
    await http().get('/api/me').set('Cookie', cookie).expect(401);
  });

  it('odmietne krátke heslo', async () => {
    await http()
      .post('/api/auth/sign-up/email')
      .set('Origin', ORIGIN)
      .send({ name: 'X', email: `test-${randomUUID()}@britva.test`, password: 'kratke' })
      .expect(400);
  });

  it('CORS preflight na /api/auth povolí WEB_URL', async () => {
    const res = await http()
      .options('/api/auth/sign-in/email')
      .set('Origin', ORIGIN)
      .set('Access-Control-Request-Method', 'POST');
    expect(res.status).toBeLessThan(300);
    expect(res.headers['access-control-allow-origin']).toBe(ORIGIN);
  });
});
