import { bookingCodeSchema } from '@britva/shared';
import { generateBookingCode } from './booking-code.util.js';

describe('generateBookingCode', () => {
  it('generuje platné kódy bez zameniteľných znakov', () => {
    const codes = Array.from({ length: 500 }, generateBookingCode);
    for (const code of codes) {
      expect(bookingCodeSchema.safeParse(code).success).toBe(true);
      expect(code.slice(3)).not.toMatch(/[01OIL]/);
    }
    expect(new Set(codes).size).toBeGreaterThan(490);
  });
});
