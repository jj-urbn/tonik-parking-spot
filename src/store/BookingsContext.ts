import { createContext } from 'react';
import type { Reservation } from '../types';
import type { ReservationInput } from './reservations';

export type BookingsContextValue = {
  reservations: Reservation[];
  today: Date;
  book: (input: ReservationInput) => void;
  edit: (id: string, patch: Partial<Pick<Reservation, 'personName' | 'plates' | 'note'>>) => void;
  remove: (id: string) => void;
  resetDemo: () => void;
};

export const BookingsContext = createContext<BookingsContextValue | null>(null);
