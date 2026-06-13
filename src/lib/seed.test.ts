import { describe, it, expect } from 'vitest';
import { makeSeedData } from './seed';
import { filterReservations } from '../store/reservations';
import { CURRENT_USER } from '../lib/constants';

describe('makeSeedData', () => {
  const today = new Date(2026, 5, 15); // 2026-06-15
  const seed = makeSeedData(today);

  it('produces some reservations by others and some by the current user', () => {
    expect(seed.some((r) => r.bookedBy !== CURRENT_USER)).toBe(true);
    expect(seed.some((r) => r.bookedBy === CURRENT_USER)).toBe(true);
  });

  it('includes at least one guest booking made by the current user', () => {
    expect(
      seed.some((r) => r.bookedBy === CURRENT_USER && r.personName !== CURRENT_USER),
    ).toBe(true);
  });

  it('populates every period filter non-trivially for the user', () => {
    expect(filterReservations(seed, 'week', today).length).toBeGreaterThan(0);
    expect(filterReservations(seed, 'month', today).length).toBeGreaterThan(0);
    expect(filterReservations(seed, 'year', today).length).toBeGreaterThan(0);
    expect(filterReservations(seed, 'all', today).length).toBeGreaterThan(0);
  });

  it('never double-books a spot on the same day', () => {
    const keys = seed.map((r) => `${r.date}#${r.spotId}`);
    expect(new Set(keys).size).toBe(keys.length);
  });
});
