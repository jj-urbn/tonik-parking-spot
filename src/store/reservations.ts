import type { Reservation, SpotStatus } from '../types';
import { CURRENT_USER, SPOT_IDS } from '../lib/constants';
import { isInPeriod, type Period } from '../lib/dates';

export type ReservationInput = {
  spotId: string;
  date: string;
  personName: string;
  plates: string;
  note: string;
};

export function spotStatus(
  reservations: Reservation[],
  spotId: string,
  date: string,
): SpotStatus {
  const r = reservations.find((x) => x.spotId === spotId && x.date === date);
  if (!r) return { kind: 'free' };
  return { kind: 'booked', reservation: r, byCurrentUser: r.bookedBy === CURRENT_USER };
}

export function freeCountForDay(reservations: Reservation[], date: string): number {
  const booked = new Set(
    reservations.filter((r) => r.date === date).map((r) => r.spotId),
  );
  return SPOT_IDS.filter((id) => !booked.has(id)).length;
}

export function reservationsByUser(reservations: Reservation[]): Reservation[] {
  return reservations.filter((r) => r.bookedBy === CURRENT_USER);
}

export function filterReservations(
  reservations: Reservation[],
  period: Period,
  today: Date,
): Reservation[] {
  return reservationsByUser(reservations).filter((r) => isInPeriod(r.date, period, today));
}

export function isBookable(
  reservations: Reservation[],
  spotId: string,
  date: string,
): boolean {
  return spotStatus(reservations, spotId, date).kind === 'free';
}

export function validateBooking(v: { personName: string; plates: string }): boolean {
  return v.personName.trim().length > 0 && v.plates.trim().length > 0;
}

export function addReservation(
  reservations: Reservation[],
  input: ReservationInput,
  genId: () => string,
): Reservation[] {
  const created: Reservation = {
    id: genId(),
    spotId: input.spotId,
    date: input.date,
    bookedBy: CURRENT_USER,
    personName: input.personName.trim(),
    plates: input.plates.trim(),
    note: input.note.trim(),
  };
  return [...reservations, created];
}

export function updateReservation(
  reservations: Reservation[],
  id: string,
  patch: Partial<Pick<Reservation, 'personName' | 'plates' | 'note'>>,
): Reservation[] {
  const trimmed: Partial<Pick<Reservation, 'personName' | 'plates' | 'note'>> = {};
  if (patch.personName !== undefined) trimmed.personName = patch.personName.trim();
  if (patch.plates !== undefined) trimmed.plates = patch.plates.trim();
  if (patch.note !== undefined) trimmed.note = patch.note.trim();
  return reservations.map((r) => (r.id === id ? { ...r, ...trimmed } : r));
}

export function deleteReservation(reservations: Reservation[], id: string): Reservation[] {
  return reservations.filter((r) => r.id !== id);
}
