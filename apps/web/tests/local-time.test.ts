import { describe, expect, it } from 'vitest';
import { formatDayLabel, formatSlotLabel, formatTime, localParts } from '~/utils/local-time';

describe('local-time (Europe/Bratislava)', () => {
  const now = new Date('2026-10-13T15:00:00Z'); // utorok 17:00 v Bratislave

  it('localParts počíta v časovej zóne prevádzky', () => {
    expect(localParts(new Date('2026-10-13T22:30:00Z'))).toMatchObject({
      date: '2026-10-14',
      weekday: 3,
      hour: 0,
      minute: 30,
    });
  });

  it('Dnes / Zajtra / skrátený deň s dátumom', () => {
    expect(formatDayLabel(new Date('2026-10-13T15:30:00Z'), now)).toBe('Dnes');
    expect(formatDayLabel(new Date('2026-10-14T07:00:00Z'), now)).toBe('Zajtra');
    expect(formatDayLabel(new Date('2026-10-16T07:00:00Z'), now)).toBe('Pi 16. 10.');
  });

  it('formatSlotLabel a formatTime', () => {
    expect(formatSlotLabel('2026-10-13T17:30:00.000+02:00', now)).toBe('Dnes · 17:30');
    expect(formatSlotLabel('2026-10-19T09:00:00.000+02:00', now)).toBe('Po 19. 10. · 9:00');
    expect(formatTime(new Date('2026-11-02T08:05:00Z'))).toBe('9:05'); // zimný čas UTC+1
  });
});
