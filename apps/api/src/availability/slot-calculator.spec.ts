import { addDays, todayIn, toZonedIso, weekdayOf, zonedTime } from './local-date.js';
import { computeDaySlots, type BarberDay } from './slot-calculator.js';

const MON = '2026-10-19'; // pondelok
const at = (date: string, hhmm: string) => {
  const [h, m] = hhmm.split(':').map(Number) as [number, number];
  return new Date(zonedTime(date, h * 60 + m).getTime());
};
const local = (d: Date) => toZonedIso(d).slice(11, 16);
const barber = (id: string, overrides: Partial<BarberDay> = {}): BarberDay => ({
  barberId: id,
  opensAtMin: 9 * 60,
  closesAtMin: 19 * 60,
  busy: [],
  ...overrides,
});
const longAgo = new Date('2020-01-01T00:00:00Z');

describe('computeDaySlots', () => {
  it('mriežka po 30 min, služba sa musí zmestiť pred zatvorením', () => {
    const slots = computeDaySlots({
      date: MON,
      durationMin: 45,
      barbers: [barber('a')],
      now: longAgo,
    });
    expect(slots.map((s) => local(s.startsAt))).toEqual([
      '09:00',
      '09:30',
      '10:00',
      '10:30',
      '11:00',
      '11:30',
      '12:00',
      '12:30',
      '13:00',
      '13:30',
      '14:00',
      '14:30',
      '15:00',
      '15:30',
      '16:00',
      '16:30',
      '17:00',
      '17:30',
      '18:00',
    ]);
    expect(local(slots.at(-1)!.endsAt)).toBe('18:45');
    expect(slots.every((s) => s.freeBarberIds.length === 1)).toBe(true);
  });

  it('obsadený čas blokuje prekrývajúce sa sloty, tesne susediace nie', () => {
    const busy = [{ start: at(MON, '10:00'), end: at(MON, '10:45') }];
    const slots = computeDaySlots({
      date: MON,
      durationMin: 30,
      barbers: [barber('a', { busy })],
      now: longAgo,
    });
    const free = (t: string) =>
      slots.find((s) => local(s.startsAt) === t)!.freeBarberIds.length > 0;
    expect(free('09:30')).toBe(true); // 9:30–10:00 končí presne pri začiatku
    expect(free('10:00')).toBe(false);
    expect(free('10:30')).toBe(false); // 10:30–11:00 sa prekrýva do 10:45
    expect(free('11:00')).toBe(true);
  });

  it('ktokoľvek: slot je voľný, ak je voľný aspoň jeden barber, v poradí barberov', () => {
    const busy = [{ start: at(MON, '09:00'), end: at(MON, '12:00') }];
    const slots = computeDaySlots({
      date: MON,
      durationMin: 45,
      barbers: [barber('a', { busy }), barber('b')],
      now: longAgo,
    });
    expect(slots[0]!.freeBarberIds).toEqual(['b']);
    expect(slots.find((s) => local(s.startsAt) === '12:00')!.freeBarberIds).toEqual(['a', 'b']);
  });

  it('rôzne otváracie hodiny: zjednotenie, slot len pre barberov, ktorí pracujú', () => {
    const slots = computeDaySlots({
      date: MON,
      durationMin: 60,
      barbers: [
        barber('ranny', { opensAtMin: 8 * 60, closesAtMin: 12 * 60 }),
        barber('poobedny', { opensAtMin: 13 * 60, closesAtMin: 16 * 60 }),
      ],
      now: longAgo,
    });
    const times = slots.map((s) => local(s.startsAt));
    expect(times[0]).toBe('08:00');
    expect(times).toContain('11:00');
    expect(times).not.toContain('11:30'); // ranný končí o 12:00, poobedný ešte nepracuje
    expect(times).not.toContain('12:30');
    expect(times.at(-1)).toBe('15:00');
    expect(slots.find((s) => local(s.startsAt) === '13:00')!.freeBarberIds).toEqual(['poobedny']);
  });

  it('nepárne otváracie hodiny sa zarovnajú na mriežku', () => {
    const slots = computeDaySlots({
      date: MON,
      durationMin: 30,
      barbers: [barber('a', { opensAtMin: 9 * 60 + 15, closesAtMin: 10 * 60 + 30 })],
      now: longAgo,
    });
    expect(slots.map((s) => local(s.startsAt))).toEqual(['09:30', '10:00']);
  });

  it('slot skôr ako 30 min od teraz nie je voľný', () => {
    const now = at(MON, '10:10');
    const slots = computeDaySlots({ date: MON, durationMin: 30, barbers: [barber('a')], now });
    const free = (t: string) =>
      slots.find((s) => local(s.startsAt) === t)!.freeBarberIds.length > 0;
    expect(free('10:30')).toBe(false); // 10:30 < 10:40
    expect(free('11:00')).toBe(true);
  });

  it('bez pracujúcich barberov nie sú sloty', () => {
    expect(computeDaySlots({ date: MON, durationMin: 30, barbers: [], now: longAgo })).toEqual([]);
  });

  it('zmena letného času: offset sa zmení, miestne časy ostanú', () => {
    // posun hodín v noci 28./29.3.2026 a 24./25.10.2026
    const before = computeDaySlots({
      date: '2026-03-27',
      durationMin: 30,
      barbers: [barber('a')],
      now: longAgo,
    });
    const after = computeDaySlots({
      date: '2026-03-30',
      durationMin: 30,
      barbers: [barber('a')],
      now: longAgo,
    });
    expect(toZonedIso(before[0]!.startsAt)).toBe('2026-03-27T09:00:00.000+01:00');
    expect(toZonedIso(after[0]!.startsAt)).toBe('2026-03-30T09:00:00.000+02:00');
    expect(before[0]!.startsAt.toISOString()).toBe('2026-03-27T08:00:00.000Z');
    expect(after[0]!.startsAt.toISOString()).toBe('2026-03-30T07:00:00.000Z');

    const autumn = computeDaySlots({
      date: '2026-10-26',
      durationMin: 30,
      barbers: [barber('a')],
      now: longAgo,
    });
    expect(toZonedIso(autumn[0]!.startsAt)).toBe('2026-10-26T09:00:00.000+01:00');
  });
});

describe('local-date', () => {
  it('weekdayOf, addDays cez prelom mesiaca a roka', () => {
    expect(weekdayOf('2026-10-18')).toBe(0);
    expect(weekdayOf('2026-10-24')).toBe(6);
    expect(addDays('2026-10-31', 1)).toBe('2026-11-01');
    expect(addDays('2026-12-31', 1)).toBe('2027-01-01');
  });

  it('todayIn počíta dátum v Bratislave, nie v UTC', () => {
    // 23:30 UTC 13.10. je už 14.10. v Bratislave (UTC+2)
    expect(todayIn(new Date('2026-10-13T23:30:00Z'))).toBe('2026-10-14');
    expect(todayIn(new Date('2026-10-13T21:30:00Z'))).toBe('2026-10-13');
  });
});
