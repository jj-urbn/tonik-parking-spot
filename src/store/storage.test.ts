import { describe, it, expect, beforeEach } from 'vitest';
import { loadReservations, saveReservations, STORAGE_KEY } from './storage';
import type { Reservation } from '../types';

const sample: Reservation[] = [
  { id: 'a', spotId: '01', date: '2026-06-05', bookedBy: 'X', personName: 'X', plates: 'P', note: '' },
];
const fallback = (): Reservation[] => [
  { id: 'seed', spotId: '02', date: '2026-06-05', bookedBy: 'S', personName: 'S', plates: 'S', note: '' },
];

describe('storage', () => {
  beforeEach(() => localStorage.clear());

  it('returns fallback when nothing is stored, and persists it', () => {
    const loaded = loadReservations(fallback);
    expect(loaded[0].id).toBe('seed');
    expect(localStorage.getItem(STORAGE_KEY)).not.toBeNull();
  });

  it('round-trips saved data', () => {
    saveReservations(sample);
    expect(loadReservations(fallback)[0].id).toBe('a');
  });

  it('falls back when stored data is corrupt', () => {
    localStorage.setItem(STORAGE_KEY, '{not json');
    expect(loadReservations(fallback)[0].id).toBe('seed');
  });
});
