import { Controller, Get, Query } from '@nestjs/common';
import {
  availabilityQuerySchema,
  nextFreeSlotQuerySchema,
  type AvailabilityQuery,
  type AvailabilityResponse,
  type NextFreeSlotResponse,
  type NextFreeSlotQuery,
} from '@britva/shared';
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe.js';
import { AvailabilityService } from './availability.service.js';

@Controller('availability')
export class AvailabilityController {
  constructor(private readonly availabilityService: AvailabilityService) {}

  /** Sloty pre deň: `?serviceId&barberId=<uuid|any>&date=YYYY-MM-DD`. */
  @Get()
  day(
    @Query(new ZodValidationPipe(availabilityQuerySchema)) query: AvailabilityQuery,
  ): Promise<AvailabilityResponse> {
    return this.availabilityService.getDay(query);
  }

  /** Najbližší voľný termín (karta v hero sekcii); `slot: null`, ak v horizonte nič nie je. */
  @Get('next-free')
  async nextFree(
    @Query(new ZodValidationPipe(nextFreeSlotQuerySchema)) query: NextFreeSlotQuery,
  ): Promise<NextFreeSlotResponse> {
    return { slot: await this.availabilityService.nextFree(query.serviceId) };
  }
}
