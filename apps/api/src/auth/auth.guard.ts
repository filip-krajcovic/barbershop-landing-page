import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import type { UserRole } from '@britva/shared';
import type { Request } from 'express';
import type { AuthSession, AuthUser } from './auth.js';
import { AUTH_OPTIONS, type AuthOptions } from './auth.decorator.js';
import { AuthService } from './auth.service.js';

export interface AuthenticatedRequest extends Request {
  user?: AuthUser;
  session?: AuthSession['session'];
}

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly authService: AuthService,
    private readonly reflector: Reflector,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const options =
      this.reflector.getAllAndOverride<AuthOptions | undefined>(AUTH_OPTIONS, [
        context.getHandler(),
        context.getClass(),
      ]) ?? {};
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const result = await this.authService.getSession(request.headers);

    if (!result) {
      if (options.optional) {
        return true;
      }
      throw new UnauthorizedException('Na túto akciu sa musíš prihlásiť.');
    }

    request.user = result.user;
    request.session = result.session;

    if (options.roles?.length && !options.roles.includes(result.user.role as UserRole)) {
      throw new ForbiddenException('Na túto akciu nemáš oprávnenie.');
    }
    return true;
  }
}
