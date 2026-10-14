import { CLIENT_IP_HEADER, PROXY_SECRET_HEADER } from '@britva/shared';
import type { Response } from 'express';
import { proxySecretMiddleware, type ClientIpRequest } from './proxy-secret.middleware.js';

const SECRET = 's'.repeat(32);

function run(path: string, headers: Record<string, string>) {
  const req = { path, get: (name: string) => headers[name] } as unknown as ClientIpRequest;
  const json = vi.fn();
  const res = { status: vi.fn(() => ({ json })) } as unknown as Response;
  const next = vi.fn();
  proxySecretMiddleware(SECRET)(req, res, next);
  return { req, res, json, next };
}

describe('proxySecretMiddleware', () => {
  it('so správnym kľúčom pustí request a prevezme IP návštevníka', () => {
    const { req, next } = run('/api/services', {
      [PROXY_SECRET_HEADER]: SECRET,
      [CLIENT_IP_HEADER]: '203.0.113.7',
    });
    expect(next).toHaveBeenCalled();
    expect(req.clientIp).toBe('203.0.113.7');
  });

  it('bez kľúča alebo so zlým kľúčom vráti 403 a IP neprevezme', () => {
    for (const secret of [undefined, 'zly', 'x'.repeat(32)]) {
      const headers: Record<string, string> = { [CLIENT_IP_HEADER]: '203.0.113.7' };
      if (secret) headers[PROXY_SECRET_HEADER] = secret;
      const { req, res, json, next } = run('/api/auth/get-session', headers);
      expect(next).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(403);
      expect(json).toHaveBeenCalledWith({ statusCode: 403, message: expect.any(String) });
      expect(req.clientIp).toBeUndefined();
    }
  });

  it('prázdna IP od webu (SSR) nechá rate limit na IP spojenia', () => {
    const { req, next } = run('/api/services', {
      [PROXY_SECRET_HEADER]: SECRET,
      [CLIENT_IP_HEADER]: '',
    });
    expect(next).toHaveBeenCalled();
    expect(req.clientIp).toBeUndefined();
  });

  it('/api/health je dostupné aj bez kľúča (kontrola tunela)', () => {
    expect(run('/api/health', {}).next).toHaveBeenCalled();
  });
});
