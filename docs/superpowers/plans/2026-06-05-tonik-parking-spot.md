# Tonik Parking Spot Booking System — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

> **GIT IS DEFERRED.** Per project setup, git is NOT initialized in this phase. Every task ends with a **Checkpoint** step (run tests / run the app) instead of a commit. Do not run `git init`, `git add`, or `git commit`. Git will be added in a later phase.

**Goal:** Build a fully interactive front-end prototype of Tonik's parking spot booking system — pick a day, book free spots (for yourself or guests), and manage your reservations — with all data persisted in the browser.

**Architecture:** React SPA. A pure-function store layer (`src/store/reservations.ts`) holds all booking logic and is fully unit-tested without React. A `BookingsProvider` context wraps those functions and persists state to `localStorage`. UI is composed of presentational components mapped 1:1 to the Figma component set; two views (`ReserveView`, `MyReservationsView`) are toggled by a header tab. The store's public interface is kept clean so a real backend can replace `localStorage` later.

**Tech Stack:** React 18, Vite, TypeScript, Tailwind CSS, Vitest + React Testing Library, jsdom.

**Figma reference:** `fileKey = 9s7kDgXgOB8M9ashWWd9Ek`. Pull pixel-accurate styling per component with the Figma MCP `get_design_context` tool using the node IDs listed in each component task. Spec: `docs/superpowers/specs/2026-06-05-tonik-parking-spot-design.md`.

---

## File structure

```
tonik-parking-spot/
  index.html
  package.json
  vite.config.ts
  tsconfig.json
  tailwind.config.ts
  postcss.config.js
  vitest.config.ts
  src/
    main.tsx                 # React entry
    App.tsx                  # layout shell + view tab toggle
    index.css                # Tailwind entry + base
    types.ts                 # ParkingSpot, DayRef, Reservation, SpotStatus
    lib/
      constants.ts           # CURRENT_USER, SPOT_IDS
      dates.ts               # date helpers + Polish formatting + pluralization
      seed.ts                # makeSeedData(today)
    store/
      reservations.ts        # pure logic: status, counts, filtering, CRUD, validation
      storage.ts             # localStorage load/save with corrupt-data fallback
      BookingsProvider.tsx   # React context wiring logic + persistence
    components/
      Button.tsx
      ListItem.tsx
      InfoField.tsx
      ParkingSpotCard.tsx
      ParkingSpotDetails.tsx
      Toast.tsx
      AlertDialog.tsx
    views/
      ReserveView.tsx
      MyReservationsView.tsx
  src/**/*.test.ts(x)        # colocated tests
```

---

## Task 1: Scaffold the Vite + React + TypeScript project

**Files:**
- Create: `package.json`, `vite.config.ts`, `tsconfig.json`, `tsconfig.node.json`, `index.html`, `src/main.tsx`, `src/App.tsx`, `src/index.css`

- [ ] **Step 1: Scaffold with Vite**

Run from the project root (the folder already exists and is empty except `.claude/` and `docs/`):

```bash
npm create vite@latest . -- --template react-ts
```

If prompted that the directory is not empty, choose to **ignore existing files and continue** (do NOT remove `.claude/` or `docs/`).

- [ ] **Step 2: Install dependencies**

```bash
npm install
```

- [ ] **Step 3: Replace `src/App.tsx` with a placeholder**

```tsx
export default function App() {
  return <div className="text-strong">Tonik Parking — scaffold OK</div>;
}
```

- [ ] **Step 4: Checkpoint — dev server boots**

Run: `npm run dev`
Expected: Vite prints a local URL and the page shows "Tonik Parking — scaffold OK" (the `text-strong` class won't apply yet — Tailwind comes next). Stop the server (Ctrl+C).

---

## Task 2: Install and configure Tailwind with Figma tokens

**Files:**
- Create: `tailwind.config.ts`, `postcss.config.js`
- Modify: `src/index.css`

- [ ] **Step 1: Install Tailwind**

```bash
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p --ts
```

- [ ] **Step 2: Write `tailwind.config.ts` with Figma tokens**

```ts
import type { Config } from 'tailwindcss';

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        strong: '#1b1917',        // Content/Strong
        default: '#45403c',       // Content/Default
        muted: '#78716b',         // Content/Muted
        'on-accent': '#f5f5f4',   // Content/On Accent
        'on-accent-muted': '#d7d3d1',
        surface: '#f5f5f4',       // Background/Default
        'surface-muted': '#e7e5e4', // Background/Muted
        accent: '#0c0a09',        // Background/Accent
        border: '#e7e5e4',        // Border/Default
      },
      fontSize: {
        xs: ['16px', '1.4'],
        sm: ['20px', '1.4'],
        '4xl': ['36px', '1.2'],
        '5xl': ['48px', '1.1'],
      },
      fontWeight: { normal: '400' },
    },
  },
  plugins: [],
} satisfies Config;
```

- [ ] **Step 3: Set `src/index.css` to the Tailwind entry**

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

html, body, #root { height: 100%; }
body { background-color: #f5f5f4; color: #45403c; }
```

- [ ] **Step 4: Checkpoint — Tailwind applies**

Run: `npm run dev`
Expected: the placeholder text now renders in the dark `strong` color (`#1b1917`). Stop the server.

---

## Task 3: Set up Vitest + React Testing Library

**Files:**
- Create: `vitest.config.ts`, `src/test-setup.ts`
- Modify: `package.json` (add `test` script)

- [ ] **Step 1: Install test deps**

```bash
npm install -D vitest @testing-library/react @testing-library/jest-dom jsdom
```

- [ ] **Step 2: Write `vitest.config.ts`**

```ts
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test-setup.ts'],
  },
});
```

- [ ] **Step 3: Write `src/test-setup.ts`**

```ts
import '@testing-library/jest-dom';
```

- [ ] **Step 4: Add the test script to `package.json`**

In the `"scripts"` object, add:

```json
"test": "vitest run",
"test:watch": "vitest"
```

- [ ] **Step 5: Write a smoke test `src/smoke.test.ts`**

```ts
import { describe, it, expect } from 'vitest';

describe('test harness', () => {
  it('runs', () => {
    expect(1 + 1).toBe(2);
  });
});
```

- [ ] **Step 6: Checkpoint — tests run**

Run: `npm test`
Expected: PASS (1 test). Then delete `src/smoke.test.ts`.

---

## Task 4: Define core types and constants

**Files:**
- Create: `src/types.ts`, `src/lib/constants.ts`

- [ ] **Step 1: Write `src/types.ts`**

```ts
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
```

- [ ] **Step 2: Write `src/lib/constants.ts`**

```ts
export const CURRENT_USER = 'Robert Makłowicz';

// Fixed set of 10 spots, ids "01".."10".
export const SPOT_IDS: string[] = Array.from({ length: 10 }, (_, i) =>
  String(i + 1).padStart(2, '0'),
);
```

- [ ] **Step 3: Checkpoint — type-check passes**

Run: `npx tsc --noEmit`
Expected: no errors.

---

## Task 5: Date helpers and Polish formatting/pluralization

**Files:**
- Create: `src/lib/dates.ts`
- Test: `src/lib/dates.test.ts`

- [ ] **Step 1: Write the failing test `src/lib/dates.test.ts`**

```ts
import { describe, it, expect } from 'vitest';
import {
  toISODate,
  rollingDays,
  formatPolishDate,
  spotsLabel,
  reservationsLabel,
  isInPeriod,
} from './dates';

describe('toISODate', () => {
  it('formats a Date to YYYY-MM-DD', () => {
    expect(toISODate(new Date(2026, 5, 5))).toBe('2026-06-05');
  });
});

describe('rollingDays', () => {
  it('returns N consecutive ISO dates starting today', () => {
    const days = rollingDays(new Date(2026, 5, 5), 3);
    expect(days).toEqual(['2026-06-05', '2026-06-06', '2026-06-07']);
  });
});

describe('formatPolishDate', () => {
  it('formats with capitalized weekday, day, and genitive month', () => {
    // 2026-04-03 is a Friday
    expect(formatPolishDate('2026-04-03')).toBe('Piątek, 3 kwietnia');
  });
});

describe('spotsLabel', () => {
  it('says Full when none free', () => {
    expect(spotsLabel(0)).toBe('Full');
  });
  it('uses correct Polish plural forms', () => {
    expect(spotsLabel(1)).toBe('1 miejsce');
    expect(spotsLabel(2)).toBe('2 miejsca');
    expect(spotsLabel(5)).toBe('5 miejsc');
    expect(spotsLabel(12)).toBe('12 miejsc');
  });
});

describe('reservationsLabel', () => {
  it('uses correct Polish plural forms', () => {
    expect(reservationsLabel(1)).toBe('1 rezerwacja');
    expect(reservationsLabel(2)).toBe('2 rezerwacje');
    expect(reservationsLabel(12)).toBe('12 rezerwacji');
    expect(reservationsLabel(53)).toBe('53 rezerwacji');
  });
});

describe('isInPeriod', () => {
  const today = new Date(2026, 5, 15); // 2026-06-15
  it('all includes any date', () => {
    expect(isInPeriod('2020-01-01', 'all', today)).toBe(true);
  });
  it('week includes the current ISO week, excludes last week', () => {
    expect(isInPeriod('2026-06-15', 'week', today)).toBe(true);
    expect(isInPeriod('2026-06-01', 'week', today)).toBe(false);
  });
  it('month includes same calendar month', () => {
    expect(isInPeriod('2026-06-01', 'month', today)).toBe(true);
    expect(isInPeriod('2026-05-31', 'month', today)).toBe(false);
  });
  it('year includes same calendar year', () => {
    expect(isInPeriod('2026-01-01', 'year', today)).toBe(true);
    expect(isInPeriod('2025-12-31', 'year', today)).toBe(false);
  });
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npm test -- dates`
Expected: FAIL ("Cannot find module './dates'" / functions undefined).

- [ ] **Step 3: Implement `src/lib/dates.ts`**

```ts
export type Period = 'week' | 'month' | 'year' | 'all';

export function toISODate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function parseISO(iso: string): Date {
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(y, m - 1, d);
}

export function rollingDays(start: Date, count: number): string[] {
  return Array.from({ length: count }, (_, i) => {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    return toISODate(d);
  });
}

export function formatPolishDate(iso: string): string {
  const fmt = new Intl.DateTimeFormat('pl-PL', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });
  const s = fmt.format(parseISO(iso));
  return s.charAt(0).toUpperCase() + s.slice(1);
}

// Polish quantity plural: returns 'one' | 'few' | 'many'
function plForm(n: number): 'one' | 'few' | 'many' {
  if (n === 1) return 'one';
  const last = n % 10;
  const lastTwo = n % 100;
  if (last >= 2 && last <= 4 && !(lastTwo >= 12 && lastTwo <= 14)) return 'few';
  return 'many';
}

export function spotsLabel(free: number): string {
  if (free === 0) return 'Full';
  const word = { one: 'miejsce', few: 'miejsca', many: 'miejsc' }[plForm(free)];
  return `${free} ${word}`;
}

export function reservationsLabel(n: number): string {
  const word = { one: 'rezerwacja', few: 'rezerwacje', many: 'rezerwacji' }[plForm(n)];
  return `${n} ${word}`;
}

// Monday-based ISO week key, e.g. "2026-W25"
function isoWeekKey(d: Date): string {
  const date = new Date(d);
  date.setHours(0, 0, 0, 0);
  // Thursday of the current week decides the year.
  date.setDate(date.getDate() + 3 - ((date.getDay() + 6) % 7));
  const week1 = new Date(date.getFullYear(), 0, 4);
  const week =
    1 +
    Math.round(
      ((date.getTime() - week1.getTime()) / 86400000 -
        3 +
        ((week1.getDay() + 6) % 7)) /
        7,
    );
  return `${date.getFullYear()}-W${String(week).padStart(2, '0')}`;
}

export function isInPeriod(iso: string, period: Period, today: Date): boolean {
  if (period === 'all') return true;
  const d = parseISO(iso);
  if (period === 'year') return d.getFullYear() === today.getFullYear();
  if (period === 'month') {
    return (
      d.getFullYear() === today.getFullYear() &&
      d.getMonth() === today.getMonth()
    );
  }
  // week
  return isoWeekKey(d) === isoWeekKey(today);
}
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `npm test -- dates`
Expected: PASS (all cases).

- [ ] **Step 5: Checkpoint**

Run: `npx tsc --noEmit && npm test -- dates`
Expected: no type errors, tests pass.

---

## Task 6: Pure reservations logic (status, counts, filtering, CRUD, validation)

**Files:**
- Create: `src/store/reservations.ts`
- Test: `src/store/reservations.test.ts`

- [ ] **Step 1: Write the failing test `src/store/reservations.test.ts`**

```ts
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
    expect(filterReservations(all, 'week', today).length).toBe(2);
    expect(filterReservations(all, 'all', today).length).toBe(2);
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
  it('deletes a reservation by id', () => {
    const next = deleteReservation(all, 'r2');
    expect(next.map((r) => r.id)).toEqual(['r1', 'r3']);
  });
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npm test -- reservations`
Expected: FAIL (module not found).

- [ ] **Step 3: Implement `src/store/reservations.ts`**

```ts
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
  return reservations.map((r) => (r.id === id ? { ...r, ...patch } : r));
}

export function deleteReservation(reservations: Reservation[], id: string): Reservation[] {
  return reservations.filter((r) => r.id !== id);
}
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `npm test -- reservations`
Expected: PASS.

- [ ] **Step 5: Checkpoint**

Run: `npx tsc --noEmit && npm test`
Expected: no type errors, all tests pass.

---

## Task 7: Seed data generator

**Files:**
- Create: `src/lib/seed.ts`
- Test: `src/lib/seed.test.ts`

- [ ] **Step 1: Write the failing test `src/lib/seed.test.ts`**

```ts
import { describe, it, expect } from 'vitest';
import { makeSeedData } from './seed';
import { filterReservations } from '../store/reservations';
import { CURRENT_USER } from '../lib/constants';

describe('makeSeedData', () => {
  const today = new Date(2026, 5, 15); // 2026-06-15
  const seed = makeSeedData(today);

  it('produces some reservations by others and some by the current user', () => {
    expect(seed.some((r) => r.bookedBy !== CURRENT_USER)).toBe(true);
    expect(seed.some((r) => r.bookedBy === CURRENT_USER)).toBe(true);
  });

  it('includes at least one guest booking made by the current user', () => {
    expect(
      seed.some((r) => r.bookedBy === CURRENT_USER && r.personName !== CURRENT_USER),
    ).toBe(true);
  });

  it('populates every period filter non-trivially for the user', () => {
    expect(filterReservations(seed, 'week', today).length).toBeGreaterThan(0);
    expect(filterReservations(seed, 'month', today).length).toBeGreaterThan(0);
    expect(filterReservations(seed, 'year', today).length).toBeGreaterThan(0);
    expect(filterReservations(seed, 'all', today).length).toBeGreaterThan(0);
  });

  it('never double-books a spot on the same day', () => {
    const keys = seed.map((r) => `${r.date}#${r.spotId}`);
    expect(new Set(keys).size).toBe(keys.length);
  });
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npm test -- seed`
Expected: FAIL (module not found).

- [ ] **Step 3: Implement `src/lib/seed.ts`**

```ts
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
  const thisMonthEarlier = dayOffset(today, -10); // same month if today's day-of-month > 10; acceptable for demo
  const earlierThisYear = `${today.getFullYear()}-01-15`;

  return [
    // Others' bookings for "today" — render as Zarezerwowane (view-only) in the grid.
    { id: 's1', spotId: '01', date: todayISO, bookedBy: 'Anna Nowak', personName: 'Anna Nowak', plates: 'WX1234A', note: '' },
    { id: 's2', spotId: '04', date: todayISO, bookedBy: 'Piotr Lis', personName: 'Piotr Lis', plates: 'KR5678B', note: '' },
    // Current user — this week (today): own booking.
    { id: 's3', spotId: '09', date: todayISO, bookedBy: CURRENT_USER, personName: CURRENT_USER, plates: 'PY4922H', note: 'Będę od 9 do 17' },
    // Current user — earlier this month: a guest booking.
    { id: 's4', spotId: '02', date: thisMonthEarlier, bookedBy: CURRENT_USER, personName: 'Gość Jan', plates: 'AB123CD', note: 'Klient' },
    // Current user — earlier this year.
    { id: 's5', spotId: '03', date: earlierThisYear, bookedBy: CURRENT_USER, personName: CURRENT_USER, plates: 'PY4922H', note: '' },
  ];
}
```

NOTE: `thisMonthEarlier` uses `today - 10 days`. If a task reviewer runs on a day-of-month ≤ 10 this could fall into the previous month; that is acceptable for demo seed data (the "month" filter still has `s3` from today). Do not over-engineer.

- [ ] **Step 4: Run the test to verify it passes**

Run: `npm test -- seed`
Expected: PASS. (If the `month` assertion is flaky near month-start, note it is covered by the same-day reservation `s3`.)

- [ ] **Step 5: Checkpoint**

Run: `npm test`
Expected: all tests pass.

---

## Task 8: localStorage persistence layer

**Files:**
- Create: `src/store/storage.ts`
- Test: `src/store/storage.test.ts`

- [ ] **Step 1: Write the failing test `src/store/storage.test.ts`**

```ts
import { describe, it, expect, beforeEach } from 'vitest';
import { loadReservations, saveReservations, STORAGE_KEY } from './storage';
import type { Reservation } from '../types';

const sample: Reservation[] = [
  { id: 'a', spotId: '01', date: '2026-06-05', bookedBy: 'X', personName: 'X', plates: 'P', note: '' },
];
const fallback = (): Reservation[] => [
  { id: 'seed', spotId: '02', date: '2026-06-05', bookedBy: 'S', personName: 'S', plates: 'S', note: '' },
];

describe('storage', () => {
  beforeEach(() => localStorage.clear());

  it('returns fallback when nothing is stored, and persists it', () => {
    const loaded = loadReservations(fallback);
    expect(loaded[0].id).toBe('seed');
    expect(localStorage.getItem(STORAGE_KEY)).not.toBeNull();
  });

  it('round-trips saved data', () => {
    saveReservations(sample);
    expect(loadReservations(fallback)[0].id).toBe('a');
  });

  it('falls back when stored data is corrupt', () => {
    localStorage.setItem(STORAGE_KEY, '{not json');
    expect(loadReservations(fallback)[0].id).toBe('seed');
  });
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npm test -- storage`
Expected: FAIL (module not found).

- [ ] **Step 3: Implement `src/store/storage.ts`**

```ts
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
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `npm test -- storage`
Expected: PASS.

- [ ] **Step 5: Checkpoint**

Run: `npm test`
Expected: all tests pass.

---

## Task 9: BookingsProvider context

**Files:**
- Create: `src/store/BookingsProvider.tsx`
- Test: `src/store/BookingsProvider.test.tsx`

- [ ] **Step 1: Write the failing test `src/store/BookingsProvider.test.tsx`**

```tsx
import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import { BookingsProvider, useBookings } from './BookingsProvider';
import { STORAGE_KEY } from './storage';

function Probe() {
  const { reservations, book } = useBookings();
  return (
    <div>
      <span data-testid="count">{reservations.length}</span>
      <button onClick={() => book({ spotId: '07', date: '2026-06-05', personName: 'A', plates: 'B', note: '' })}>
        book
      </button>
    </div>
  );
}

describe('BookingsProvider', () => {
  beforeEach(() => localStorage.clear());

  it('seeds on first render and persists a new booking', () => {
    render(
      <BookingsProvider>
        <Probe />
      </BookingsProvider>,
    );
    const before = Number(screen.getByTestId('count').textContent);
    expect(before).toBeGreaterThan(0);

    act(() => {
      screen.getByText('book').click();
    });
    expect(Number(screen.getByTestId('count').textContent)).toBe(before + 1);
    expect(localStorage.getItem(STORAGE_KEY)).toContain('07');
  });
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npm test -- BookingsProvider`
Expected: FAIL (module not found).

- [ ] **Step 3: Implement `src/store/BookingsProvider.tsx`**

```tsx
import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
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

// id generator that avoids Math.random/Date.now coupling in pure logic;
// here in the React layer a timestamp-based id is fine.
function genId(): string {
  return `r-${Date.now()}-${Math.floor(performance.now() * 1000)}`;
}

export function BookingsProvider({ children }: { children: ReactNode }) {
  const today = useMemo(() => new Date(), []);
  const [reservations, setReservations] = useState<Reservation[]>(() =>
    loadReservations(() => makeSeedData(new Date())),
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
    resetDemo: () => setReservations(makeSeedData(new Date())),
  };

  return <BookingsContext.Provider value={value}>{children}</BookingsContext.Provider>;
}

export function useBookings(): BookingsContextValue {
  const ctx = useContext(BookingsContext);
  if (!ctx) throw new Error('useBookings must be used within BookingsProvider');
  return ctx;
}
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `npm test -- BookingsProvider`
Expected: PASS.

- [ ] **Step 5: Checkpoint**

Run: `npx tsc --noEmit && npm test`
Expected: no type errors, all tests pass.

---

## Task 10: Button component

**Files:**
- Create: `src/components/Button.tsx`
- Test: `src/components/Button.test.tsx`

**Figma:** node `6003:637` (variants: Primary/Secondary × Default/Hover). Pull styling with `get_design_context` for `nodeId: "6003:637"`.

- [ ] **Step 1: Write the failing test `src/components/Button.test.tsx`**

```tsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Button } from './Button';

describe('Button', () => {
  it('renders its label and fires onClick', () => {
    const onClick = vi.fn();
    render(<Button variant="primary" onClick={onClick}>Zapisz</Button>);
    screen.getByRole('button', { name: 'Zapisz' }).click();
    expect(onClick).toHaveBeenCalledOnce();
  });

  it('does not fire onClick when disabled', () => {
    const onClick = vi.fn();
    render(<Button variant="primary" disabled onClick={onClick}>Zapisz</Button>);
    screen.getByRole('button', { name: 'Zapisz' }).click();
    expect(onClick).not.toHaveBeenCalled();
  });
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npm test -- Button`
Expected: FAIL (module not found).

- [ ] **Step 3: Implement `src/components/Button.tsx`**

Pull the exact paddings/radius/typography from Figma node `6003:637` and apply via Tailwind token classes. Baseline implementation:

```tsx
import type { ButtonHTMLAttributes, ReactNode } from 'react';

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant: 'primary' | 'secondary';
  children: ReactNode;
};

export function Button({ variant, children, className = '', ...rest }: Props) {
  const base =
    'inline-flex items-center justify-center px-6 py-3 text-xs transition-colors disabled:opacity-40 disabled:cursor-not-allowed';
  const styles =
    variant === 'primary'
      ? 'bg-accent text-on-accent hover:bg-strong'
      : 'bg-surface text-strong border border-border hover:bg-surface-muted';
  return (
    <button className={`${base} ${styles} ${className}`} {...rest}>
      {children}
    </button>
  );
}
```

Adjust spacing/colors to match the Figma node if they differ from the baseline.

- [ ] **Step 4: Run the test to verify it passes**

Run: `npm test -- Button`
Expected: PASS.

- [ ] **Step 5: Checkpoint**

Run: `npm test -- Button`
Expected: PASS.

---

## Task 11: ListItem component

**Files:**
- Create: `src/components/ListItem.tsx`
- Test: `src/components/ListItem.test.tsx`

**Figma:** node `6003:129` (states Default/Hover/Active). Pull styling with `get_design_context` for `nodeId: "6003:129"`.

- [ ] **Step 1: Write the failing test `src/components/ListItem.test.tsx`**

```tsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ListItem } from './ListItem';

describe('ListItem', () => {
  it('renders label and trailing text and fires onSelect', () => {
    const onSelect = vi.fn();
    render(<ListItem label="Piątek, 3 kwietnia" trailing="2 miejsca" active={false} onSelect={onSelect} />);
    expect(screen.getByText('Piątek, 3 kwietnia')).toBeInTheDocument();
    expect(screen.getByText('2 miejsca')).toBeInTheDocument();
    screen.getByText('Piątek, 3 kwietnia').click();
    expect(onSelect).toHaveBeenCalledOnce();
  });
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npm test -- ListItem`
Expected: FAIL (module not found).

- [ ] **Step 3: Implement `src/components/ListItem.tsx`**

Pull styling from Figma node `6003:129`. Baseline:

```tsx
type Props = {
  label: string;
  trailing?: string;
  active: boolean;
  onSelect: () => void;
};

export function ListItem({ label, trailing, active, onSelect }: Props) {
  const base = 'flex w-full items-center justify-between px-8 py-3 text-xs text-left transition-colors';
  const state = active ? 'bg-accent text-on-accent' : 'text-default hover:bg-surface-muted';
  return (
    <button className={`${base} ${state}`} onClick={onSelect}>
      <span>{label}</span>
      {trailing && (
        <span className={active ? 'text-on-accent-muted' : 'text-muted'}>{trailing}</span>
      )}
    </button>
  );
}
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `npm test -- ListItem`
Expected: PASS.

- [ ] **Step 5: Checkpoint**

Run: `npm test -- ListItem`
Expected: PASS.

---

## Task 12: InfoField component

**Files:**
- Create: `src/components/InfoField.tsx`
- Test: `src/components/InfoField.test.tsx`

**Figma:** node `6005:301` (Default/Active/Filled/View Only). Pull styling with `get_design_context` for `nodeId: "6005:301"`.

Behavior: a labeled field. When `readOnly`, renders the value as static text (View Only variant). Otherwise an input. `required` shows a `*` after the label.

- [ ] **Step 1: Write the failing test `src/components/InfoField.test.tsx`**

```tsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { InfoField } from './InfoField';

describe('InfoField', () => {
  it('renders an editable input and reports changes', () => {
    const onChange = vi.fn();
    render(<InfoField label="Blachy" required value="" onChange={onChange} />);
    expect(screen.getByText('Blachy')).toBeInTheDocument();
    fireEvent.change(screen.getByLabelText('Blachy'), { target: { value: 'PY4922H' } });
    expect(onChange).toHaveBeenCalledWith('PY4922H');
  });

  it('renders read-only value as static text (no input)', () => {
    render(<InfoField label="Miejsce" readOnly value="09" />);
    expect(screen.getByText('09')).toBeInTheDocument();
    expect(screen.queryByRole('textbox')).toBeNull();
  });
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npm test -- InfoField`
Expected: FAIL (module not found).

- [ ] **Step 3: Implement `src/components/InfoField.tsx`**

Pull styling from Figma node `6005:301`. Baseline:

```tsx
import { useId } from 'react';

type Props = {
  label: string;
  value: string;
  required?: boolean;
  readOnly?: boolean;
  onChange?: (value: string) => void;
};

export function InfoField({ label, value, required, readOnly, onChange }: Props) {
  const id = useId();
  return (
    <div className="flex flex-col gap-1 py-3 border-b border-border">
      <label htmlFor={id} className="text-xs text-muted">
        {label}
        {required && <span className="text-strong"> *</span>}
      </label>
      {readOnly ? (
        <span className="text-sm text-strong">{value}</span>
      ) : (
        <input
          id={id}
          className="text-sm text-strong bg-transparent outline-none"
          value={value}
          onChange={(e) => onChange?.(e.target.value)}
        />
      )}
    </div>
  );
}
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `npm test -- InfoField`
Expected: PASS.

- [ ] **Step 5: Checkpoint**

Run: `npm test -- InfoField`
Expected: PASS.

---

## Task 13: ParkingSpotCard component

**Files:**
- Create: `src/components/ParkingSpotCard.tsx`
- Test: `src/components/ParkingSpotCard.test.tsx`

**Figma:** node `6003:529` (State Default/Active × Booked True/False). Pull styling with `get_design_context` for `nodeId: "6003:529"`. Visual rules from the design:
- Free + not selected: light surface, big spot number, "Wolne".
- Booked: hatched/muted background, "Zarezerwowane" + person name.
- Selected ("Wybrane"): accent (black) background, "Wybrane".

- [ ] **Step 1: Write the failing test `src/components/ParkingSpotCard.test.tsx`**

```tsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ParkingSpotCard } from './ParkingSpotCard';

describe('ParkingSpotCard', () => {
  it('shows Wolne for a free spot and is clickable', () => {
    const onClick = vi.fn();
    render(<ParkingSpotCard spotId="07" state="free" onClick={onClick} />);
    expect(screen.getByText('07')).toBeInTheDocument();
    expect(screen.getByText('Wolne')).toBeInTheDocument();
    screen.getByText('07').click();
    expect(onClick).toHaveBeenCalledOnce();
  });

  it('shows Zarezerwowane and the person name for a booked spot', () => {
    render(<ParkingSpotCard spotId="01" state="booked" personName="Robert" onClick={() => {}} />);
    expect(screen.getByText('Zarezerwowane')).toBeInTheDocument();
    expect(screen.getByText('Robert')).toBeInTheDocument();
  });

  it('shows Wybrane when selected', () => {
    render(<ParkingSpotCard spotId="09" state="selected" onClick={() => {}} />);
    expect(screen.getByText('Wybrane')).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npm test -- ParkingSpotCard`
Expected: FAIL (module not found).

- [ ] **Step 3: Implement `src/components/ParkingSpotCard.tsx`**

Pull styling (incl. the hatch pattern, node `6005:2589`) from Figma node `6003:529`. Baseline:

```tsx
type State = 'free' | 'booked' | 'selected';

type Props = {
  spotId: string;
  state: State;
  personName?: string;
  onClick: () => void;
};

export function ParkingSpotCard({ spotId, state, personName, onClick }: Props) {
  const bg =
    state === 'selected'
      ? 'bg-accent text-on-accent'
      : state === 'booked'
        ? 'bg-surface-muted text-muted'
        : 'bg-surface text-strong hover:bg-surface-muted';
  const caption =
    state === 'selected' ? 'Wybrane' : state === 'booked' ? 'Zarezerwowane' : 'Wolne';

  return (
    <button
      onClick={onClick}
      className={`flex h-full w-full flex-col justify-between p-6 border border-border text-left transition-colors ${bg}`}
    >
      <span className="text-4xl">{spotId}</span>
      <span className="text-xs">
        {caption}
        {state === 'booked' && personName && <span className="block">{personName}</span>}
      </span>
    </button>
  );
}
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `npm test -- ParkingSpotCard`
Expected: PASS.

- [ ] **Step 5: Checkpoint**

Run: `npm test -- ParkingSpotCard`
Expected: PASS.

---

## Task 14: Toast component

**Files:**
- Create: `src/components/Toast.tsx`
- Test: `src/components/Toast.test.tsx`

**Figma:** node `6005:1174`. Pull styling with `get_design_context` for `nodeId: "6005:1174"`. Dark card, title + body, top-right, auto-dismisses.

- [ ] **Step 1: Write the failing test `src/components/Toast.test.tsx`**

```tsx
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Toast } from './Toast';

describe('Toast', () => {
  it('renders title and body when open', () => {
    render(<Toast open title="Rezerwacja potwierdzona" body="Twoja rezerwacja została zapisana" onDismiss={() => {}} />);
    expect(screen.getByText('Rezerwacja potwierdzona')).toBeInTheDocument();
  });

  it('renders nothing when closed', () => {
    const { container } = render(<Toast open={false} title="x" body="y" onDismiss={() => {}} />);
    expect(container).toBeEmptyDOMElement();
  });
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npm test -- Toast`
Expected: FAIL (module not found).

- [ ] **Step 3: Implement `src/components/Toast.tsx`**

Pull styling from Figma node `6005:1174`. Baseline:

```tsx
import { useEffect } from 'react';

type Props = {
  open: boolean;
  title: string;
  body: string;
  onDismiss: () => void;
};

export function Toast({ open, title, body, onDismiss }: Props) {
  useEffect(() => {
    if (!open) return;
    const t = setTimeout(onDismiss, 3000);
    return () => clearTimeout(t);
  }, [open, onDismiss]);

  if (!open) return null;
  return (
    <div className="fixed right-6 top-6 w-80 bg-accent text-on-accent p-6">
      <p className="text-xs font-normal text-on-accent">{title}</p>
      <p className="text-xs text-on-accent-muted mt-1">{body}</p>
    </div>
  );
}
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `npm test -- Toast`
Expected: PASS.

- [ ] **Step 5: Checkpoint**

Run: `npm test -- Toast`
Expected: PASS.

---

## Task 15: AlertDialog component

**Files:**
- Create: `src/components/AlertDialog.tsx`
- Test: `src/components/AlertDialog.test.tsx`

**Figma:** node `6005:2303` (and overlay usage `6005:2313`). Pull styling with `get_design_context` for `nodeId: "6005:2303"`. Modal over a dimmed overlay, title + body, Secondary (cancel) + Primary (confirm) buttons.

- [ ] **Step 1: Write the failing test `src/components/AlertDialog.test.tsx`**

```tsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { AlertDialog } from './AlertDialog';

describe('AlertDialog', () => {
  it('fires onConfirm and onCancel', () => {
    const onConfirm = vi.fn();
    const onCancel = vi.fn();
    render(
      <AlertDialog
        open
        title="Usunąć rezerwację?"
        body="Tej operacji nie można cofnąć."
        confirmLabel="Usuń"
        cancelLabel="Anuluj"
        onConfirm={onConfirm}
        onCancel={onCancel}
      />,
    );
    screen.getByRole('button', { name: 'Usuń' }).click();
    screen.getByRole('button', { name: 'Anuluj' }).click();
    expect(onConfirm).toHaveBeenCalledOnce();
    expect(onCancel).toHaveBeenCalledOnce();
  });

  it('renders nothing when closed', () => {
    const { container } = render(
      <AlertDialog open={false} title="x" body="y" confirmLabel="a" cancelLabel="b" onConfirm={() => {}} onCancel={() => {}} />,
    );
    expect(container).toBeEmptyDOMElement();
  });
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npm test -- AlertDialog`
Expected: FAIL (module not found).

- [ ] **Step 3: Implement `src/components/AlertDialog.tsx`**

Pull styling from Figma node `6005:2303`. Use the `Button` component for actions. Baseline:

```tsx
import { Button } from './Button';

type Props = {
  open: boolean;
  title: string;
  body: string;
  confirmLabel: string;
  cancelLabel: string;
  onConfirm: () => void;
  onCancel: () => void;
};

export function AlertDialog({ open, title, body, confirmLabel, cancelLabel, onConfirm, onCancel }: Props) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-strong/40">
      <div className="w-[400px] bg-surface p-8">
        <p className="text-sm text-strong">{title}</p>
        <p className="text-xs text-muted mt-2">{body}</p>
        <div className="mt-6 flex justify-end gap-3">
          <Button variant="secondary" onClick={onCancel}>{cancelLabel}</Button>
          <Button variant="primary" onClick={onConfirm}>{confirmLabel}</Button>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `npm test -- AlertDialog`
Expected: PASS.

- [ ] **Step 5: Checkpoint**

Run: `npm test -- AlertDialog`
Expected: PASS.

---

## Task 16: ParkingSpotDetails component (right panel)

**Files:**
- Create: `src/components/ParkingSpotDetails.tsx`
- Test: `src/components/ParkingSpotDetails.test.tsx`

**Figma:** node `6005:628` (Status None/Booked/Available/Booked-User). Pull styling with `get_design_context` for `nodeId: "6005:628"`.

This is a controlled, presentational panel. It renders one of four statuses and exposes callbacks; it holds NO store logic.

```ts
// Props shape (define in the component file):
type DetailsStatus = 'none' | 'available' | 'booked' | 'booked-user';
type Props = {
  status: DetailsStatus;
  spotId?: string;
  // form values (used for 'available' and 'booked-user')
  personName: string;
  plates: string;
  note: string;
  canSubmit: boolean;          // validity, computed by the view
  onChangePersonName: (v: string) => void;
  onChangePlates: (v: string) => void;
  onChangeNote: (v: string) => void;
  onSubmit: () => void;        // 'available' → Zarezerwuj ; 'booked-user' → Zapisz
  onDelete?: () => void;       // 'booked-user' only
};
```

- [ ] **Step 1: Write the failing test `src/components/ParkingSpotDetails.test.tsx`**

```tsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ParkingSpotDetails } from './ParkingSpotDetails';

const baseProps = {
  personName: '', plates: '', note: '', canSubmit: false,
  onChangePersonName: () => {}, onChangePlates: () => {}, onChangeNote: () => {},
  onSubmit: () => {},
};

describe('ParkingSpotDetails', () => {
  it('shows the empty prompt for status none', () => {
    render(<ParkingSpotDetails status="none" {...baseProps} />);
    expect(screen.getByText(/Wybierz miejsce/)).toBeInTheDocument();
  });

  it('shows a Zarezerwuj button for available', () => {
    render(<ParkingSpotDetails status="available" spotId="07" {...baseProps} canSubmit />);
    expect(screen.getByRole('button', { name: 'Zarezerwuj' })).toBeEnabled();
  });

  it('disables submit when canSubmit is false', () => {
    render(<ParkingSpotDetails status="available" spotId="07" {...baseProps} />);
    expect(screen.getByRole('button', { name: 'Zarezerwuj' })).toBeDisabled();
  });

  it('shows Zapisz and Usuń for booked-user', () => {
    const onDelete = vi.fn();
    render(<ParkingSpotDetails status="booked-user" spotId="09" {...baseProps} canSubmit onDelete={onDelete} />);
    expect(screen.getByRole('button', { name: 'Zapisz' })).toBeInTheDocument();
    screen.getByRole('button', { name: 'Usuń' }).click();
    expect(onDelete).toHaveBeenCalledOnce();
  });

  it('renders read-only details for booked (someone else)', () => {
    render(<ParkingSpotDetails status="booked" spotId="01" {...baseProps} personName="Anna Nowak" plates="WX1234A" />);
    expect(screen.getByText('Anna Nowak')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Zarezerwuj' })).toBeNull();
  });
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npm test -- ParkingSpotDetails`
Expected: FAIL (module not found).

- [ ] **Step 3: Implement `src/components/ParkingSpotDetails.tsx`**

Pull styling from Figma node `6005:628`. Compose `InfoField` and `Button`. Baseline:

```tsx
import { InfoField } from './InfoField';
import { Button } from './Button';

type DetailsStatus = 'none' | 'available' | 'booked' | 'booked-user';

type Props = {
  status: DetailsStatus;
  spotId?: string;
  personName: string;
  plates: string;
  note: string;
  canSubmit: boolean;
  onChangePersonName: (v: string) => void;
  onChangePlates: (v: string) => void;
  onChangeNote: (v: string) => void;
  onSubmit: () => void;
  onDelete?: () => void;
};

export function ParkingSpotDetails(props: Props) {
  const { status, spotId, personName, plates, note } = props;

  if (status === 'none') {
    return (
      <div className="p-8 text-center text-xs text-muted">
        Wybierz miejsce aby zobaczyć szczegóły lub je zarezerwować
      </div>
    );
  }

  const editable = status === 'available' || status === 'booked-user';

  return (
    <div className="flex h-full flex-col p-8">
      <div className="flex-1">
        {spotId && <InfoField label="Miejsce" value={spotId} readOnly />}
        <InfoField label="Imię" required value={personName} readOnly={!editable} onChange={props.onChangePersonName} />
        <InfoField label="Blachy" required value={plates} readOnly={!editable} onChange={props.onChangePlates} />
        <InfoField label="Notatka" value={note} readOnly={!editable} onChange={props.onChangeNote} />
      </div>

      {status === 'available' && (
        <Button variant="primary" disabled={!props.canSubmit} onClick={props.onSubmit}>
          Zarezerwuj
        </Button>
      )}

      {status === 'booked-user' && (
        <div className="flex flex-col gap-3">
          <Button variant="primary" disabled={!props.canSubmit} onClick={props.onSubmit}>
            Zapisz
          </Button>
          <Button variant="secondary" onClick={props.onDelete}>
            Usuń
          </Button>
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `npm test -- ParkingSpotDetails`
Expected: PASS.

- [ ] **Step 5: Checkpoint**

Run: `npx tsc --noEmit && npm test`
Expected: no type errors, all tests pass.

---

## Task 17: ReserveView

**Files:**
- Create: `src/views/ReserveView.tsx`
- Test: `src/views/ReserveView.test.tsx`

**Figma:** screen `6003:5`. Layout: left aside = day picker (ListItem rows with `spotsLabel` counts); center = header (Wybrany dzień + `formatPolishDate`) and a 5-column grid of `ParkingSpotCard`; right = `ParkingSpotDetails`. On booking, show `Toast`.

Behavior:
- Local state: `selectedDate` (default first rolling day), `selectedSpotId | null`, form fields (`personName` default `CURRENT_USER`, `plates`, `note`), `toastOpen`.
- Day list built from `rollingDays(today, 8)`, each row's trailing = `spotsLabel(freeCountForDay(reservations, date))`.
- Selecting a day clears the selected spot/form.
- Clicking a spot:
  - free → select it; details status `available`; reset form (personName=CURRENT_USER, plates='', note='').
  - booked by current user → status `booked-user`, fields from the reservation.
  - booked by other → status `booked`, fields from the reservation (read-only).
- `canSubmit = validateBooking({ personName, plates })`.
- Submit when `available` → `book({ spotId, date, personName, plates, note })`, open toast, clear selection.
- Submit when `booked-user` → `edit(reservation.id, { personName, plates, note })`.
- Delete (booked-user) handled via dialog in Task 19 wiring; for this task expose an `onDelete` that calls a passed-in handler (or inline `remove`) — see Step 3.

- [ ] **Step 1: Write the failing test `src/views/ReserveView.test.tsx`**

```tsx
import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { BookingsProvider } from '../store/BookingsProvider';
import { ReserveView } from './ReserveView';

function renderView() {
  return render(
    <BookingsProvider>
      <ReserveView />
    </BookingsProvider>,
  );
}

describe('ReserveView', () => {
  beforeEach(() => localStorage.clear());

  it('renders the spot grid (01..10)', () => {
    renderView();
    expect(screen.getByText('01')).toBeInTheDocument();
    expect(screen.getByText('10')).toBeInTheDocument();
  });

  it('selecting a free spot reveals the booking form with a disabled button until plates entered', () => {
    renderView();
    // spot 07 is free in seed for today
    fireEvent.click(screen.getByText('07'));
    const button = screen.getByRole('button', { name: 'Zarezerwuj' });
    expect(button).toBeDisabled(); // name pre-filled, plates empty
    fireEvent.change(screen.getByLabelText('Blachy'), { target: { value: 'NEW123' } });
    expect(button).toBeEnabled();
  });

  it('booking a spot shows the confirmation toast', () => {
    renderView();
    fireEvent.click(screen.getByText('07'));
    fireEvent.change(screen.getByLabelText('Blachy'), { target: { value: 'NEW123' } });
    fireEvent.click(screen.getByRole('button', { name: 'Zarezerwuj' }));
    expect(screen.getByText('Rezerwacja potwierdzona')).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npm test -- ReserveView`
Expected: FAIL (module not found).

- [ ] **Step 3: Implement `src/views/ReserveView.tsx`**

Pull layout spacing from Figma screen `6003:5`. Implementation:

```tsx
import { useMemo, useState } from 'react';
import { useBookings } from '../store/BookingsProvider';
import { SPOT_IDS, CURRENT_USER } from '../lib/constants';
import { rollingDays, formatPolishDate, spotsLabel } from '../lib/dates';
import { spotStatus, freeCountForDay, validateBooking } from '../store/reservations';
import { ListItem } from '../components/ListItem';
import { ParkingSpotCard } from '../components/ParkingSpotCard';
import { ParkingSpotDetails } from '../components/ParkingSpotDetails';
import { Toast } from '../components/Toast';
import { AlertDialog } from '../components/AlertDialog';

export function ReserveView() {
  const { reservations, today, book, edit, remove } = useBookings();
  const days = useMemo(() => rollingDays(today, 8), [today]);

  const [selectedDate, setSelectedDate] = useState(days[0]);
  const [selectedSpotId, setSelectedSpotId] = useState<string | null>(null);
  const [personName, setPersonName] = useState(CURRENT_USER);
  const [plates, setPlates] = useState('');
  const [note, setNote] = useState('');
  const [toastOpen, setToastOpen] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const status = selectedSpotId ? spotStatus(reservations, selectedSpotId, selectedDate) : null;

  function selectDay(date: string) {
    setSelectedDate(date);
    setSelectedSpotId(null);
  }

  function selectSpot(spotId: string) {
    setSelectedSpotId(spotId);
    const s = spotStatus(reservations, spotId, selectedDate);
    if (s.kind === 'booked') {
      setPersonName(s.reservation.personName);
      setPlates(s.reservation.plates);
      setNote(s.reservation.note);
    } else {
      setPersonName(CURRENT_USER);
      setPlates('');
      setNote('');
    }
  }

  function clearSelection() {
    setSelectedSpotId(null);
    setPersonName(CURRENT_USER);
    setPlates('');
    setNote('');
  }

  function handleSubmit() {
    if (!selectedSpotId) return;
    if (status?.kind === 'booked' && status.byCurrentUser) {
      edit(status.reservation.id, { personName, plates, note });
    } else {
      book({ spotId: selectedSpotId, date: selectedDate, personName, plates, note });
      setToastOpen(true);
    }
    clearSelection();
  }

  const detailsStatus =
    !selectedSpotId || !status
      ? 'none'
      : status.kind === 'free'
        ? 'available'
        : status.byCurrentUser
          ? 'booked-user'
          : 'booked';

  return (
    <>
      <div className="grid h-full grid-cols-[302px_1fr_302px]">
        {/* Day picker */}
        <aside className="border-r border-border">
          <div className="px-8 py-6 text-xs text-muted">Wybierz dzień</div>
          {days.map((d) => (
            <ListItem
              key={d}
              label={formatPolishDate(d)}
              trailing={spotsLabel(freeCountForDay(reservations, d))}
              active={d === selectedDate}
              onSelect={() => selectDay(d)}
            />
          ))}
        </aside>

        {/* Spot grid */}
        <main className="flex flex-col">
          <header className="px-8 pt-12 pb-6">
            <p className="text-xs text-muted">Wybrany dzień</p>
            <h1 className="text-5xl text-strong">{formatPolishDate(selectedDate)}</h1>
          </header>
          <div className="grid flex-1 grid-cols-5 gap-0 px-8">
            {SPOT_IDS.map((id) => {
              const s = spotStatus(reservations, id, selectedDate);
              const state =
                selectedSpotId === id && s.kind === 'free'
                  ? 'selected'
                  : s.kind === 'booked'
                    ? 'booked'
                    : 'free';
              return (
                <div key={id} className="h-[216px]">
                  <ParkingSpotCard
                    spotId={id}
                    state={state}
                    personName={s.kind === 'booked' ? s.reservation.personName : undefined}
                    onClick={() => selectSpot(id)}
                  />
                </div>
              );
            })}
          </div>
        </main>

        {/* Details */}
        <aside className="border-l border-border">
          <div className="px-8 py-6 text-xs text-muted">Szczegóły</div>
          <ParkingSpotDetails
            status={detailsStatus}
            spotId={selectedSpotId ?? undefined}
            personName={personName}
            plates={plates}
            note={note}
            canSubmit={validateBooking({ personName, plates })}
            onChangePersonName={setPersonName}
            onChangePlates={setPlates}
            onChangeNote={setNote}
            onSubmit={handleSubmit}
            onDelete={() => setConfirmDelete(true)}
          />
        </aside>
      </div>

      <Toast
        open={toastOpen}
        title="Rezerwacja potwierdzona"
        body="Twoja rezerwacja została zapisana i jest widoczna dla innych"
        onDismiss={() => setToastOpen(false)}
      />

      <AlertDialog
        open={confirmDelete}
        title="Usunąć rezerwację?"
        body="Tej operacji nie można cofnąć."
        confirmLabel="Usuń"
        cancelLabel="Anuluj"
        onCancel={() => setConfirmDelete(false)}
        onConfirm={() => {
          if (status?.kind === 'booked') remove(status.reservation.id);
          setConfirmDelete(false);
          clearSelection();
        }}
      />
    </>
  );
}
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `npm test -- ReserveView`
Expected: PASS.

- [ ] **Step 5: Checkpoint**

Run: `npx tsc --noEmit && npm test`
Expected: no type errors, all tests pass.

---

## Task 18: MyReservationsView

**Files:**
- Create: `src/views/MyReservationsView.tsx`
- Test: `src/views/MyReservationsView.test.tsx`

**Figma:** screen `6005:1317`. Layout: left aside = period filter (ListItem rows with `reservationsLabel` counts); center = the user's reservations grouped by day (day header via `formatPolishDate`, then a wide `ParkingSpotCard`-style row per reservation); right = editable `ParkingSpotDetails` with Zapisz/Usuń.

Behavior:
- Local state: `period` (default `'week'`), `selectedReservationId | null`, form fields, `confirmDelete`.
- Period list: `[{key:'all',label:'Od początku'},{key:'week',label:'Ten tydzień'},{key:'month',label:'Ten miesiąc'},{key:'year',label:'Ten rok'}]`, trailing = `reservationsLabel(count)` where count = `filterReservations(reservations, key, today).length`.
- Center list = `filterReservations(reservations, period, today)` grouped by date (sorted descending).
- Selecting a reservation loads its fields; details status = `booked-user`.
- Zapisz → `edit`; Usuń → open dialog → `remove`.

- [ ] **Step 1: Write the failing test `src/views/MyReservationsView.test.tsx`**

```tsx
import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent, within } from '@testing-library/react';
import { BookingsProvider } from '../store/BookingsProvider';
import { MyReservationsView } from './MyReservationsView';

function renderView() {
  return render(
    <BookingsProvider>
      <MyReservationsView />
    </BookingsProvider>,
  );
}

describe('MyReservationsView', () => {
  beforeEach(() => localStorage.clear());

  it('shows the period filters', () => {
    renderView();
    expect(screen.getByText('Ten tydzień')).toBeInTheDocument();
    expect(screen.getByText('Od początku')).toBeInTheDocument();
  });

  it('lists the user reservation for this week (spot 09 in seed)', () => {
    renderView();
    expect(screen.getByText('09')).toBeInTheDocument();
  });

  it('selecting a reservation shows the editable form with Zapisz and Usuń', () => {
    renderView();
    fireEvent.click(screen.getByText('09'));
    expect(screen.getByRole('button', { name: 'Zapisz' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Usuń' })).toBeInTheDocument();
  });

  it('deleting via the dialog removes the reservation', () => {
    renderView();
    fireEvent.click(screen.getByText('09'));
    fireEvent.click(screen.getByRole('button', { name: 'Usuń' }));
    // confirm in dialog
    const dialogConfirm = screen.getAllByRole('button', { name: 'Usuń' }).at(-1)!;
    fireEvent.click(dialogConfirm);
    expect(screen.queryByText('09')).toBeNull();
  });
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npm test -- MyReservationsView`
Expected: FAIL (module not found).

- [ ] **Step 3: Implement `src/views/MyReservationsView.tsx`**

Pull layout spacing from Figma screen `6005:1317`. Implementation:

```tsx
import { useMemo, useState } from 'react';
import { useBookings } from '../store/BookingsProvider';
import { formatPolishDate, reservationsLabel, type Period } from '../lib/dates';
import { filterReservations, validateBooking } from '../store/reservations';
import { ListItem } from '../components/ListItem';
import { ParkingSpotCard } from '../components/ParkingSpotCard';
import { ParkingSpotDetails } from '../components/ParkingSpotDetails';
import { AlertDialog } from '../components/AlertDialog';

const PERIODS: { key: Period; label: string }[] = [
  { key: 'all', label: 'Od początku' },
  { key: 'week', label: 'Ten tydzień' },
  { key: 'month', label: 'Ten miesiąc' },
  { key: 'year', label: 'Ten rok' },
];

export function MyReservationsView() {
  const { reservations, today, edit, remove } = useBookings();
  const [period, setPeriod] = useState<Period>('week');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [personName, setPersonName] = useState('');
  const [plates, setPlates] = useState('');
  const [note, setNote] = useState('');
  const [confirmDelete, setConfirmDelete] = useState(false);

  const list = useMemo(
    () => filterReservations(reservations, period, today).slice().sort((a, b) => b.date.localeCompare(a.date)),
    [reservations, period, today],
  );

  // group by date
  const groups = useMemo(() => {
    const map = new Map<string, typeof list>();
    for (const r of list) {
      const arr = map.get(r.date) ?? [];
      arr.push(r);
      map.set(r.date, arr);
    }
    return [...map.entries()];
  }, [list]);

  const selected = list.find((r) => r.id === selectedId) ?? null;

  function select(id: string) {
    const r = reservations.find((x) => x.id === id);
    if (!r) return;
    setSelectedId(id);
    setPersonName(r.personName);
    setPlates(r.plates);
    setNote(r.note);
  }

  return (
    <>
      <div className="grid h-full grid-cols-[302px_1fr_302px]">
        {/* Period filter */}
        <aside className="border-r border-border">
          <div className="px-8 py-6 text-xs text-muted">Moje rezerwacje</div>
          {PERIODS.map((p) => (
            <ListItem
              key={p.key}
              label={p.label}
              trailing={reservationsLabel(filterReservations(reservations, p.key, today).length)}
              active={p.key === period}
              onSelect={() => setPeriod(p.key)}
            />
          ))}
        </aside>

        {/* Grouped reservations */}
        <main className="flex flex-col overflow-auto px-8 pt-12">
          {groups.map(([date, items]) => (
            <section key={date} className="mb-8">
              <p className="text-xs text-muted mb-4">{formatPolishDate(date)}</p>
              <div className="flex flex-col gap-2">
                {items.map((r) => (
                  <div key={r.id} className="h-[120px]">
                    <ParkingSpotCard
                      spotId={r.spotId}
                      state={selectedId === r.id ? 'selected' : 'booked'}
                      personName={r.personName}
                      onClick={() => select(r.id)}
                    />
                  </div>
                ))}
              </div>
            </section>
          ))}
        </main>

        {/* Editable details */}
        <aside className="border-l border-border">
          <div className="px-8 py-6 text-xs text-muted">Szczegóły</div>
          <ParkingSpotDetails
            status={selected ? 'booked-user' : 'none'}
            spotId={selected?.spotId}
            personName={personName}
            plates={plates}
            note={note}
            canSubmit={validateBooking({ personName, plates })}
            onChangePersonName={setPersonName}
            onChangePlates={setPlates}
            onChangeNote={setNote}
            onSubmit={() => selected && edit(selected.id, { personName, plates, note })}
            onDelete={() => setConfirmDelete(true)}
          />
        </aside>
      </div>

      <AlertDialog
        open={confirmDelete}
        title="Usunąć rezerwację?"
        body="Tej operacji nie można cofnąć."
        confirmLabel="Usuń"
        cancelLabel="Anuluj"
        onCancel={() => setConfirmDelete(false)}
        onConfirm={() => {
          if (selected) remove(selected.id);
          setConfirmDelete(false);
          setSelectedId(null);
        }}
      />
    </>
  );
}
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `npm test -- MyReservationsView`
Expected: PASS.

- [ ] **Step 5: Checkpoint**

Run: `npx tsc --noEmit && npm test`
Expected: no type errors, all tests pass.

---

## Task 19: App shell with tab toggle + brand header

**Files:**
- Modify: `src/App.tsx`
- Modify: `src/main.tsx` (wrap in `BookingsProvider`)
- Test: `src/App.test.tsx`

**Figma:** the top-left brand block ("Tonikowy parking" + logo) and the header tabs "Zarezerwuj | Moje rezerwacje" (screens `6003:5` / `6005:1317`).

- [ ] **Step 1: Write the failing test `src/App.test.tsx`**

```tsx
import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import App from './App';

describe('App', () => {
  beforeEach(() => localStorage.clear());

  it('shows the brand and defaults to the Reserve view (spot grid visible)', () => {
    render(<App />);
    expect(screen.getByText('Tonikowy parking')).toBeInTheDocument();
    expect(screen.getByText('Wybierz dzień')).toBeInTheDocument();
  });

  it('switches to My reservations when its tab is clicked', () => {
    render(<App />);
    fireEvent.click(screen.getByRole('button', { name: 'Moje rezerwacje' }));
    expect(screen.getByText('Ten tydzień')).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npm test -- App`
Expected: FAIL (current placeholder App).

- [ ] **Step 3: Implement `src/App.tsx`**

```tsx
import { useState } from 'react';
import { BookingsProvider } from './store/BookingsProvider';
import { ReserveView } from './views/ReserveView';
import { MyReservationsView } from './views/MyReservationsView';

type Tab = 'reserve' | 'mine';

export default function App() {
  const [tab, setTab] = useState<Tab>('reserve');

  return (
    <BookingsProvider>
      <div className="grid h-full grid-cols-[302px_1fr] grid-rows-[196px_1fr]">
        {/* Brand block */}
        <div className="row-span-2 border-r border-border p-8">
          <p className="text-xs text-muted">Tonikowy parking</p>
          <div className="mt-12 h-12 w-12 rounded-full border border-strong" aria-hidden />
          <nav className="mt-12 flex gap-4">
            <button
              className={`text-xs ${tab === 'reserve' ? 'text-strong' : 'text-muted'}`}
              onClick={() => setTab('reserve')}
            >
              Zarezerwuj
            </button>
            <button
              className={`text-xs ${tab === 'mine' ? 'text-strong' : 'text-muted'}`}
              onClick={() => setTab('mine')}
            >
              Moje rezerwacje
            </button>
          </nav>
        </div>

        {/* View area (its own header + 3-column body live inside each view) */}
        <div className="col-start-2 row-span-2 overflow-hidden">
          {tab === 'reserve' ? <ReserveView /> : <MyReservationsView />}
        </div>
      </div>
    </BookingsProvider>
  );
}
```

NOTE: `ReserveView`/`MyReservationsView` already render their own day/period aside, body, and details aside in a 3-column grid. The App shell provides the brand column + tab nav. Confirm against the Figma that the brand column and the views' asides align; adjust column widths if the Figma differs. The test only requires the brand text, "Wybierz dzień", and tab switching to work.

- [ ] **Step 4: Update `src/main.tsx`**

Ensure it renders `<App />` (no extra provider — `App` includes `BookingsProvider`):

```tsx
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
```

- [ ] **Step 5: Run the test to verify it passes**

Run: `npm test -- App`
Expected: PASS.

- [ ] **Step 6: Checkpoint**

Run: `npx tsc --noEmit && npm test`
Expected: no type errors, ALL tests pass.

---

## Task 20: Visual polish pass against Figma + reset-demo affordance

**Files:**
- Modify: any component/view needing visual correction
- Modify: `src/App.tsx` (add a small "reset demo data" control)

- [ ] **Step 1: Add a reset-demo control**

In `src/App.tsx`, inside the brand column, add below the nav (uses `useBookings` — note: `App` renders the provider, so put the control in a tiny child component or move it into a view; simplest is a small component):

Create `src/components/ResetDemo.tsx`:

```tsx
import { useBookings } from '../store/BookingsProvider';

export function ResetDemo() {
  const { resetDemo } = useBookings();
  return (
    <button className="text-xs text-muted underline mt-12" onClick={resetDemo}>
      Resetuj dane demo
    </button>
  );
}
```

Render `<ResetDemo />` inside `App`'s brand column (it is within `BookingsProvider`).

- [ ] **Step 2: Run the app and compare to Figma**

Run: `npm run dev`
Open the local URL. Compare against the two Figma screens. For each component that looks off, call the Figma MCP `get_design_context` with the node ID from its task and correct paddings/colors/typography using the Tailwind token classes. Check:
- Day picker active row (black bg, white text).
- Spot grid: free vs booked (hatch/muted) vs selected (black).
- Details panel: empty prompt; booking form; read-only state.
- Toast appears top-right after booking and auto-dismisses.
- Delete confirmation dialog over a dimmed overlay.
- My reservations: period counts, grouped list, edit/delete.

- [ ] **Step 3: Checkpoint — full suite + type check + build**

Run: `npx tsc --noEmit && npm test && npm run build`
Expected: no type errors, all tests pass, production build succeeds (confirms Vercel deployability).

---

## Self-review notes (plan author)

- **Spec coverage:** stack (T1–T3), tokens (T2), data model + current user + bookedBy/personName (T4, T6), seed incl. period population + guest (T7), derived status/counts/filter (T6), persistence + corrupt fallback (T8), provider (T9), all 7 components (T10–T16), both views with all four detail statuses (T16–T18), validation + no-double-book + delete dialog (T6, T16–T18), tab shell + brand (T19), reset demo (T20), Vercel build check (T20). All §-sections covered.
- **Type consistency:** `Reservation`/`SpotStatus`/`ReservationInput` defined once (T4/T6) and reused; provider methods `book/edit/remove/resetDemo` used consistently across T17–T20; `Period` from `dates.ts` used in `reservations.ts` and both views.
- **Deferred git:** no commit steps anywhere; each task ends in a verification checkpoint, per project instruction.
