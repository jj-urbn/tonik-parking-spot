import { describe, it, expect } from 'vitest';
import {
  spotStatus,
  freeCountForDay,
  reservationsByUser,
  filterReservations,
  isBookable,
  validateBooking,
  addReservation,
  updateReservation,
  deleteReservation,
  type ReservationInput,
} from './reservations';
import type { Reservation } from '../types';
import { CURRENT_USER } from '../lib/constants';

const mine: Reservation = {
  id: 'r1', spotId: '09', date: '2026-06-05',
  bookedBy: CURRENT_USER, personName: CURRENT_USER, plates: 'PY4922H', note: '',
};
const guest: Reservation = {
  id: 'r2', spotId: '02', date: '2026-06-05',
  bookedBy: CURRENT_USER, personName: 'Gość Jan', plates: 'AB123CD', note: '',
};
const other: Reservation = {
  id: 'r3', spotId: '01', date: '2026-06-05',
  bookedBy: 'Anna Nowak', personName: 'Anna Nowak', plates: 'ZZ999ZZ', note: '',
};
const all = [mine, guest, other];

describe('spotStatus', () => {
  it('is free when no reservation matches', () => {
    expect(spotStatus(all, '05', '2026-06-05')).toEqual({ kind: 'free' });
  });
  it('is booked by current user for own + guest bookings', () => {
    expect(spotStatus(all, '09', '2026-06-05')).toMatchObject({ kind: 'booked', byCurrentUser: true });
    expect(spotStatus(all, '02', '2026-06-05')).toMatchObject({ kind: 'booked', byCurrentUser: true });
  });
  it('is booked by someone else for others', () => {
    expect(spotStatus(all, '01', '2026-06-05')).toMatchObject({ kind: 'booked', byCurrentUser: false });
  });
});

describe('freeCountForDay', () => {
  it('counts spots without a reservation that day (10 total)', () => {
    expect(freeCountForDay(all, '2026-06-05')).toBe(7); // 10 - 3 booked
    expect(freeCountForDay(all, '2026-06-06')).toBe(10);
  });
});

describe('reservationsByUser', () => {
  it('returns everything the user created, including guest bookings', () => {
    expect(reservationsByUser(all).map((r) => r.id)).toEqual(['r1', 'r2']);
  });
});

describe('filterReservations', () => {
  it('filters user reservations by period', () => {
    const today = new Date(2026, 5, 5);
    expect(filterReservations(all, 'week', today).map((r) => r.id)).toEqual(['r1', 'r2']);
    expect(filterReservations(all, 'all', today).map((r) => r.id)).toEqual(['r1', 'r2']);
  });
});

describe('isBookable', () => {
  it('is false for an occupied spot, true for a free one', () => {
    expect(isBookable(all, '09', '2026-06-05')).toBe(false);
    expect(isBookable(all, '05', '2026-06-05')).toBe(true);
  });
});

describe('validateBooking', () => {
  it('requires personName and plates', () => {
    expect(validateBooking({ personName: '', plates: 'X' })).toBe(false);
    expect(validateBooking({ personName: 'X', plates: '' })).toBe(false);
    expect(validateBooking({ personName: 'X', plates: 'Y' })).toBe(true);
  });
});

describe('CRUD', () => {
  const input: ReservationInput = { spotId: '05', date: '2026-06-05', personName: 'Gość', plates: 'NEW111', note: 'hi' };
  it('adds a reservation with a generated id and bookedBy = current user', () => {
    const next = addReservation([], input, () => 'gen-id');
    expect(next).toHaveLength(1);
    expect(next[0]).toMatchObject({ id: 'gen-id', bookedBy: CURRENT_USER, spotId: '05', personName: 'Gość' });
  });
  it('updates an existing reservation by id', () => {
    const next = updateReservation(all, 'r1', { plates: 'CHANGED', note: 'n' });
    expect(next.find((r) => r.id === 'r1')!.plates).toBe('CHANGED');
  });
  it('trims patched string fields on update', () => {
    const next = updateReservation(all, 'r1', { plates: '  PZ7  ', note: '  ok  ' });
    const r = next.find((x) => x.id === 'r1')!;
    expect(r.plates).toBe('PZ7');
    expect(r.note).toBe('ok');
  });
  it('deletes a reservation by id', () => {
    const next = deleteReservation(all, 'r2');
    expect(next.map((r) => r.id)).toEqual(['r1', 'r3']);
  });
});
