import { Body, Controller, Delete, Get, HttpCode, Param, Patch, Post, Query } from '@nestjs/common';
import {
  barberListQuerySchema,
  createBarberSchema,
  idSchema,
  updateBarberSchema,
  type Barber,
  type BarberListQuery,
  type CreateBarber,
  type UpdateBarber,
} from '@britva/shared';
import { Auth } from '../auth/auth.decorator.js';
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe.js';
import { BarbersService } from './barbers.service.js';

@Controller('barbers')
export class BarbersController {
  constructor(private readonly barbersService: BarbersService) {}

  /** Verejný zoznam aktívnych barberov, voliteľne iba pre danú službu. */
  @Get()
  list(
    @Query(new ZodValidationPipe(barberListQuerySchema)) query: BarberListQuery,
  ): Promise<Barber[]> {
    return this.barbersService.listActive(query.serviceId);
  }

  @Post()
  @Auth({ roles: ['admin'] })
  create(@Body(new ZodValidationPipe(createBarberSchema)) body: CreateBarber): Promise<Barber> {
    return this.barbersService.create(body);
  }

  @Patch(':id')
  @Auth({ roles: ['admin'] })
  update(
    @Param('id', new ZodValidationPipe(idSchema)) id: string,
    @Body(new ZodValidationPipe(updateBarberSchema)) body: UpdateBarber,
  ): Promise<Barber> {
    return this.barbersService.update(id, body);
  }

  @Delete(':id')
  @HttpCode(204)
  @Auth({ roles: ['admin'] })
  remove(@Param('id', new ZodValidationPipe(idSchema)) id: string): Promise<void> {
    return this.barbersService.deactivate(id);
  }
}
