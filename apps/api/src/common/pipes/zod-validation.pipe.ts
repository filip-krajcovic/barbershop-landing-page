import { BadRequestException, Injectable, PipeTransform } from '@nestjs/common';
import type { ZodType } from 'zod';

export interface ValidationErrorItem {
  path: string;
  message: string;
}

/**
 * Validuje vstup (body, query, param) zod schémou z @britva/shared
 * a vráti sparsovanú (znormalizovanú) hodnotu.
 *
 * Použitie: `@Body(new ZodValidationPipe(createBookingSchema)) body: CreateBooking`
 */
@Injectable()
export class ZodValidationPipe<T> implements PipeTransform<unknown, T> {
  constructor(private readonly schema: ZodType<T>) {}

  transform(value: unknown): T {
    const result = this.schema.safeParse(value);
    if (result.success) {
      return result.data;
    }
    const errors: ValidationErrorItem[] = result.error.issues.map((issue) => ({
      path: issue.path.join('.'),
      message: issue.message,
    }));
    throw new BadRequestException({ message: 'Neplatné vstupné údaje.', errors });
  }
}
