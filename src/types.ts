export type ParkingSpot = {
  id: string; // "01".."10"
};

export type DayRef = {
  date: string; // ISO date, e.g. "2026-06-05"
};

export type Reservation = {
  id: string;
  spotId: string;     // which spot ("01".."10")
  date: string;       // ISO date
  bookedBy: string;   // creator — the current user at creation time
  personName: string; // occupant — defaults to current user, editable (guest)
  plates: string;     // required
  note: string;       // optional
};

// Status of a spot for a given day, from the current user's perspective.
export type SpotStatus =
  | { kind: 'free' }
  | { kind: 'booked'; reservation: Reservation; byCurrentUser: boolean };
