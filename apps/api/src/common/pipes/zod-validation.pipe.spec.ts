import { BadRequestException } from '@nestjs/common';
import { createBookingSchema } from '@britva/shared';
import { z } from 'zod';
import { ZodValidationPipe } from './zod-validation.pipe.js';

describe('ZodValidationPipe', () => {
  it('vráti sparsovanú hodnotu', () => {
    const pipe = new ZodValidationPipe(z.object({ page: z.coerce.number().int() }));
    expect(pipe.transform({ page: '2' })).toEqual({ page: 2 });
  });

  it('vyhodí 400 so zoznamom chýb a cestami k poliam', () => {
    const pipe = new ZodValidationPipe(createBookingSchema);
    try {
      pipe.transform({ serviceId: 'x', customerName: 'J' });
      expect.unreachable();
    } catch (error) {
      expect(error).toBeInstanceOf(BadRequestException);
      const body = (error as BadRequestException).getResponse() as {
        errors: { path: string }[];
      };
      const paths = body.errors.map((e) => e.path);
      expect(paths).toEqual(expect.arrayContaining(['serviceId', 'customerName', 'phone']));
    }
  });
});
