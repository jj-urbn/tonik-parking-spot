import { useContext } from 'react';
import { BookingsContext, type BookingsContextValue } from './BookingsContext';

export function useBookings(): BookingsContextValue {
  const ctx = useContext(BookingsContext);
  if (!ctx) throw new Error('useBookings must be used within BookingsProvider');
  return ctx;
}
