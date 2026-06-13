import type { Reservation } from '../types';

export const STORAGE_KEY = 'tonik-parking:reservations:v1';

export function saveReservations(reservations: Reservation[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(reservations));
}

export function loadReservations(fallback: () => Reservation[]): Reservation[] {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (raw) {
    try {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed as Reservation[];
    } catch {
      // fall through to fallback
    }
  }
  const seeded = fallback();
  saveReservations(seeded);
  return seeded;
}
