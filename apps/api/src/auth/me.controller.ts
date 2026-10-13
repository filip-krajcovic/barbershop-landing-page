import { Controller, Get } from '@nestjs/common';
import type { Me, UserRole } from '@britva/shared';
import type { AuthUser } from './auth.js';
import { Auth } from './auth.decorator.js';
import { CurrentUser } from './current-user.decorator.js';

@Controller('me')
export class MeController {
  @Get()
  @Auth()
  me(@CurrentUser() user: AuthUser): Me {
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role as UserRole,
      phone: user.phone ?? null,
    };
  }
}
