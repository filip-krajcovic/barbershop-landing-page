import { Body, Controller, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import {
  bookingListQuerySchema,
  createBookingSchema,
  idSchema,
  type BookingDetails,
  type BookingListQuery,
  type CreateBooking,
} from '@britva/shared';
import type { AuthUser } from '../auth/auth.js';
import { Auth } from '../auth/auth.decorator.js';
import { CurrentUser } from '../auth/current-user.decorator.js';
import { ClientIpThrottlerGuard } from '../common/client-ip-throttler.guard.js';
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe.js';
import { BookingsService } from './bookings.service.js';

@Controller('bookings')
export class BookingsController {
  constructor(private readonly bookingsService: BookingsService) {}

  /** Rezervácia pre hosťa aj prihláseného používateľa (vtedy sa priradí k účtu). */
  @Post()
  @UseGuards(ClientIpThrottlerGuard)
  @Auth({ optional: true })
  create(
    @Body(new ZodValidationPipe(createBookingSchema)) body: CreateBooking,
    @CurrentUser() user: AuthUser | undefined,
  ): Promise<BookingDetails> {
    return this.bookingsService.create(body, user);
  }

  @Get('me')
  @Auth()
  mine(@CurrentUser() user: AuthUser): Promise<BookingDetails[]> {
    return this.bookingsService.listMine(user.id);
  }

  @Patch(':id/cancel')
  @Auth()
  cancel(
    @Param('id', new ZodValidationPipe(idSchema)) id: string,
    @CurrentUser() user: AuthUser,
  ): Promise<BookingDetails> {
    return this.bookingsService.cancel(id, user);
  }

  @Get()
  @Auth({ roles: ['admin'] })
  list(
    @Query(new ZodValidationPipe(bookingListQuerySchema)) query: BookingListQuery,
  ): Promise<BookingDetails[]> {
    return this.bookingsService.list(query);
  }
}
