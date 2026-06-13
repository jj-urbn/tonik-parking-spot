export const CURRENT_USER = 'Robert Makłowicz';

// Fixed set of 10 spots, ids "01".."10".
export const SPOT_IDS: string[] = Array.from({ length: 10 }, (_, i) =>
  String(i + 1).padStart(2, '0'),
);
