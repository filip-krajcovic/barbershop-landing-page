import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { App } from 'supertest/types.js';
import { AppModule } from '../src/app.module.js';
import { setupApp } from '../src/app.setup.js';

describe('API (e2e)', () => {
  let app: INestApplication<App>;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({ imports: [AppModule] }).compile();
    app = moduleRef.createNestApplication();
    setupApp(app);
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('GET /api/health', () => {
    return request(app.getHttpServer()).get('/api/health').expect(200).expect({ status: 'ok' });
  });

  it('neznáma cesta vráti 404 v jednotnom formáte', async () => {
    const res = await request(app.getHttpServer()).get('/api/neexistuje').expect(404);
    expect(res.body).toMatchObject({ statusCode: 404, message: expect.any(String) });
  });

  it('povolí CORS pre WEB_URL s credentials', async () => {
    const res = await request(app.getHttpServer())
      .get('/api/health')
      .set('Origin', 'http://localhost:3000')
      .expect(200);
    expect(res.headers['access-control-allow-origin']).toBe('http://localhost:3000');
    expect(res.headers['access-control-allow-credentials']).toBe('true');
  });
});
