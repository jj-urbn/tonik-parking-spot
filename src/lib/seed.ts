import type { Reservation } from '../types';
import { CURRENT_USER } from './constants';
import { toISODate } from './dates';

function dayOffset(base: Date, days: number): string {
  const d = new Date(base);
  d.setDate(base.getDate() + days);
  return toISODate(d);
}

// Deterministic seed (no Math.random) so tests are stable.
export function makeSeedData(today: Date): Reservation[] {
  const todayISO = toISODate(today);
  const thisMonthEarlier = dayOffset(today, -10);
  const earlierThisYear = `${today.getFullYear()}-01-15`;

  return [
    { id: 's1', spotId: '01', date: todayISO, bookedBy: 'Anna Nowak', personName: 'Anna Nowak', plates: 'WX1234A', note: '' },
    { id: 's2', spotId: '04', date: todayISO, bookedBy: 'Piotr Lis', personName: 'Piotr Lis', plates: 'KR5678B', note: '' },
    { id: 's3', spotId: '09', date: todayISO, bookedBy: CURRENT_USER, personName: CURRENT_USER, plates: 'PY4922H', note: 'Będę od 9 do 17' },
    { id: 's4', spotId: '02', date: thisMonthEarlier, bookedBy: CURRENT_USER, personName: 'Gość Jan', plates: 'AB123CD', note: 'Klient' },
    { id: 's5', spotId: '03', date: earlierThisYear, bookedBy: CURRENT_USER, personName: CURRENT_USER, plates: 'PY4922H', note: '' },
  ];
}
