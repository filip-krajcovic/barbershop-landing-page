import { Body, Controller, Delete, Get, HttpCode, Param, Patch, Post } from '@nestjs/common';
import {
  createServiceSchema,
  idSchema,
  updateServiceSchema,
  type CreateService,
  type Service,
  type UpdateService,
} from '@britva/shared';
import { Auth } from '../auth/auth.decorator.js';
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe.js';
import { ServicesService } from './services.service.js';

@Controller('services')
export class ServicesController {
  constructor(private readonly servicesService: ServicesService) {}

  /** Verejný cenník – iba aktívne služby. */
  @Get()
  list(): Promise<Service[]> {
    return this.servicesService.listActive();
  }

  @Post()
  @Auth({ roles: ['admin'] })
  create(@Body(new ZodValidationPipe(createServiceSchema)) body: CreateService): Promise<Service> {
    return this.servicesService.create(body);
  }

  @Patch(':id')
  @Auth({ roles: ['admin'] })
  update(
    @Param('id', new ZodValidationPipe(idSchema)) id: string,
    @Body(new ZodValidationPipe(updateServiceSchema)) body: UpdateService,
  ): Promise<Service> {
    return this.servicesService.update(id, body);
  }

  @Delete(':id')
  @HttpCode(204)
  @Auth({ roles: ['admin'] })
  remove(@Param('id', new ZodValidationPipe(idSchema)) id: string): Promise<void> {
    return this.servicesService.deactivate(id);
  }
}
