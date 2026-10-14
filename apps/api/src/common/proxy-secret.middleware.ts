import { timingSafeEqual } from 'node:crypto';
import { CLIENT_IP_HEADER, PROXY_SECRET_HEADER } from '@britva/shared';
import type { NextFunction, Request, Response } from 'express';

/** Request s IP adresou návštevníka, ktorú poslal server webu. */
export type ClientIpRequest = Request & { clientIp?: string };

/** Endpoint bez tajného kľúča – na overenie, že API a tunel bežia. */
const PUBLIC_PATHS = new Set(['/api/health']);

/**
 * Pri nastavenom `PROXY_SECRET` prijme API iba requesty zo servera webu so správnou hlavičkou
 * `x-britva-proxy-secret`. Iba vtedy sa dá veriť IP návštevníka z `x-britva-client-ip`
 * (použije ju rate limit), inak by si ju ktokoľvek podvrhol.
 */
export function proxySecretMiddleware(secret: string) {
  const expected = Buffer.from(secret);
  return (req: ClientIpRequest, res: Response, next: NextFunction): void => {
    if (PUBLIC_PATHS.has(req.path)) return next();
    const received = Buffer.from(req.get(PROXY_SECRET_HEADER) ?? '');
    if (received.length !== expected.length || !timingSafeEqual(received, expected)) {
      res.status(403).json({ statusCode: 403, message: 'API je dostupné iba cez web.' });
      return;
    }
    req.clientIp = req.get(CLIENT_IP_HEADER) || undefined;
    next();
  };
}
