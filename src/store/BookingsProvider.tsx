import { useEffect, useState, type ReactNode } from 'react';
import { loadReservations, saveReservations } from './storage';
import { makeSeedData } from '../lib/seed';
import { addReservation, updateReservation, deleteReservation, type ReservationInput } from './reservations';
import { BookingsContext, type BookingsContextValue } from './BookingsContext';
import type { Reservation } from '../types';

function genId(): string {
  return `r-${Date.now()}-${Math.floor(performance.now() * 1000)}`;
}

export function BookingsProvider({ children }: { children: ReactNode }) {
  const [today] = useState(() => new Date());
  const [reservations, setReservations] = useState<Reservation[]>(() =>
    loadReservations(() => makeSeedData(today)),
  );

  useEffect(() => {
    saveReservations(reservations);
  }, [reservations]);

  const value: BookingsContextValue = {
    reservations,
    today,
    book: (input: ReservationInput) => setReservations((rs) => addReservation(rs, input, genId)),
    edit: (id, patch) => setReservations((rs) => updateReservation(rs, id, patch)),
    remove: (id) => setReservations((rs) => deleteReservation(rs, id)),
    resetDemo: () => setReservations(makeSeedData(today)),
    clearAll: () => setReservations([]),
  };

  return <BookingsContext.Provider value={value}>{children}</BookingsContext.Provider>;
}
