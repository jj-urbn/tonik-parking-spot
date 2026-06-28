import { describe, it, expect } from 'vitest';
import {
  toISODate,
  rollingDays,
  formatPolishDate,
  spotsLabel,
  reservationsLabel,
  isInPeriod,
  isPast,
} from './dates';

describe('toISODate', () => {
  it('formats a Date to YYYY-MM-DD', () => {
    expect(toISODate(new Date(2026, 5, 5))).toBe('2026-06-05');
  });
});

describe('rollingDays', () => {
  it('returns N consecutive ISO dates starting today', () => {
    const days = rollingDays(new Date(2026, 5, 5), 3);
    expect(days).toEqual(['2026-06-05', '2026-06-06', '2026-06-07']);
  });
});

describe('formatPolishDate', () => {
  it('formats with capitalized weekday, day, and genitive month', () => {
    // 2026-04-03 is a Friday
    expect(formatPolishDate('2026-04-03')).toBe('Piątek, 3 kwietnia');
  });
});

describe('spotsLabel', () => {
  it('says Full when none free', () => {
    expect(spotsLabel(0)).toBe('Full');
  });
  it('uses correct Polish plural forms', () => {
    expect(spotsLabel(1)).toBe('1 miejsce');
    expect(spotsLabel(2)).toBe('2 miejsca');
    expect(spotsLabel(5)).toBe('5 miejsc');
    expect(spotsLabel(12)).toBe('12 miejsc');
  });
});

describe('reservationsLabel', () => {
  it('uses correct Polish plural forms', () => {
    expect(reservationsLabel(1)).toBe('1 rezerwacja');
    expect(reservationsLabel(2)).toBe('2 rezerwacje');
    expect(reservationsLabel(12)).toBe('12 rezerwacji');
    expect(reservationsLabel(53)).toBe('53 rezerwacje');
    expect(reservationsLabel(22)).toBe('22 rezerwacje');
    expect(reservationsLabel(25)).toBe('25 rezerwacji');
  });
});

describe('isInPeriod', () => {
  const today = new Date(2026, 5, 15); // 2026-06-15
  it('all includes any date', () => {
    expect(isInPeriod('2020-01-01', 'all', today)).toBe(true);
  });
  it('week includes the current ISO week, excludes last week', () => {
    expect(isInPeriod('2026-06-15', 'week', today)).toBe(true);
    expect(isInPeriod('2026-06-01', 'week', today)).toBe(false);
  });
  it('month includes same calendar month', () => {
    expect(isInPeriod('2026-06-01', 'month', today)).toBe(true);
    expect(isInPeriod('2026-05-31', 'month', today)).toBe(false);
  });
  it('year includes same calendar year', () => {
    expect(isInPeriod('2026-01-01', 'year', today)).toBe(true);
    expect(isInPeriod('2025-12-31', 'year', today)).toBe(false);
  });
});

describe('isPast', () => {
  const today = new Date(2026, 5, 28); // 2026-06-28
  it('is true for a date before today', () => {
    expect(isPast('2026-06-27', today)).toBe(true);
    expect(isPast('2025-12-31', today)).toBe(true);
  });
  it('is false for today', () => {
    expect(isPast('2026-06-28', today)).toBe(false);
  });
  it('is false for a future date', () => {
    expect(isPast('2026-06-29', today)).toBe(false);
  });
});
