import { Inject, Injectable } from '@nestjs/common';
import { fromNodeHeaders } from 'better-auth/node';
import type { IncomingHttpHeaders } from 'node:http';
import { AUTH, type Auth, type AuthSession } from './auth.js';

@Injectable()
export class AuthService {
  constructor(@Inject(AUTH) private readonly auth: Auth) {}

  /** Session z cookie v hlavičkách requestu; `null`, ak používateľ nie je prihlásený. */
  getSession(headers: IncomingHttpHeaders): Promise<AuthSession | null> {
    return this.auth.api.getSession({ headers: fromNodeHeaders(headers) });
  }
}
