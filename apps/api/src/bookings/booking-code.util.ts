import { randomInt } from 'node:crypto';

/** Bez znakov, ktoré sa dajú zameniť (0/O, 1/I/L). */
const ALPHABET = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
const LENGTH = 6;

/** Kód rezervácie pre zákazníka, napr. `BB-7K3QXM` (31^6 ≈ 887 mil. kombinácií). */
export function generateBookingCode(): string {
  let code = '';
  for (let i = 0; i < LENGTH; i++) {
    code += ALPHABET[randomInt(ALPHABET.length)];
  }
  return `BB-${code}`;
}
