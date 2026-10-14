import { CLIENT_IP_HEADER, PROXY_SECRET_HEADER } from '@britva/shared';
import type { NestExpressApplication } from '@nestjs/platform-express';
import request from 'supertest';
import { createTestApp } from './create-app.js';
import { testEnv } from './test-env.js';

// Musí byť nastavené pred importom AppModule (ConfigModule číta prostredie pri načítaní).
const { SECRET } = vi.hoisted(() => {
  const SECRET = 'proxy-secret-proxy-secret-proxy-secret';
  process.env.PROXY_SECRET = SECRET;
  process.env.BOOKING_RATE_LIMIT = '2';
  return { SECRET };
});

describe('API za proxy webu (PROXY_SECRET)', () => {
  let app: NestExpressApplication;

  beforeAll(async () => {
    app = await createTestApp();
  });

  afterAll(async () => {
    await app.close();
    // ostatné e2e súbory bežia bez proxy
    delete process.env.PROXY_SECRET;
    process.env.BOOKING_RATE_LIMIT = testEnv.BOOKING_RATE_LIMIT;
  });

  const fromWeb = (req: request.Test, ip?: string) =>
    req.set(PROXY_SECRET_HEADER, SECRET).set(CLIENT_IP_HEADER, ip ?? '');

  it('bez tajného kľúča vráti 403 (aj pre better-auth), health je dostupné', async () => {
    const server = app.getHttpServer();
    await request(server).get('/api/services').expect(403);
    await request(server).get('/api/auth/get-session').expect(403);
    await request(server).get('/api/services').set(PROXY_SECRET_HEADER, 'zly').expect(403);
    await request(server).get('/api/health').expect(200);
  });

  it('so správnym kľúčom funguje API aj better-auth', async () => {
    const server = app.getHttpServer();
    await fromWeb(request(server).get('/api/services')).expect(200);
    await fromWeb(request(server).get('/api/auth/get-session')).expect(200);
  });

  it('rate limit rezervácií počíta každú IP návštevníka zvlášť', async () => {
    const server = app.getHttpServer();
    // neplatné telo: throttler beží pred validáciou, takže aj 400 sa započíta
    const book = (ip: string) => fromWeb(request(server).post('/api/bookings'), ip).send({});
    await book('203.0.113.1').expect(400);
    await book('203.0.113.1').expect(400);
    await book('203.0.113.1').expect(429);
    // iný návštevník za tou istou proxy limit nezdieľa
    await book('203.0.113.2').expect(400);
  });
});
