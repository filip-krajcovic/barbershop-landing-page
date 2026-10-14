import { Injectable } from '@nestjs/common';
import { ThrottlerGuard } from '@nestjs/throttler';
import type { ClientIpRequest } from './proxy-secret.middleware.js';

/**
 * Rate limit podľa IP návštevníka. Za proxy webu (napr. Cloudflare Tunnel) by `req.ip` bola
 * IP proxy a všetci návštevníci by zdieľali jeden limit.
 */
@Injectable()
export class ClientIpThrottlerGuard extends ThrottlerGuard {
  protected override getTracker(req: ClientIpRequest): Promise<string> {
    return Promise.resolve(req.clientIp ?? req.ip ?? 'unknown');
  }
}
