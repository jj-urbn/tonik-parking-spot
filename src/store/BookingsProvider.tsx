import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import type { Reservation } from '../types';
import { loadReservations, saveReservations } from './storage';
import { makeSeedData } from '../lib/seed';
import {
  addReservation,
  updateReservation,
  deleteReservation,
  type ReservationInput,
} from './reservations';

type BookingsContextValue = {
  reservations: Reservation[];
  today: Date;
  book: (input: ReservationInput) => void;
  edit: (id: string, patch: Partial<Pick<Reservation, 'personName' | 'plates' | 'note'>>) => void;
  remove: (id: string) => void;
  resetDemo: () => void;
};

const BookingsContext = createContext<BookingsContextValue | null>(null);

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
    book: (input) => setReservations((rs) => addReservation(rs, input, genId)),
    edit: (id, patch) => setReservations((rs) => updateReservation(rs, id, patch)),
    remove: (id) => setReservations((rs) => deleteReservation(rs, id)),
    resetDemo: () => setReservations(makeSeedData(today)),
  };

  return <BookingsContext.Provider value={value}>{children}</BookingsContext.Provider>;
}

export function useBookings(): BookingsContextValue {
  const ctx = useContext(BookingsContext);
  if (!ctx) throw new Error('useBookings must be used within BookingsProvider');
  return ctx;
}
