# Moje rezerwacje view + tab switcher — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a "Moje rezerwacje" view listing the current user's past and upcoming bookings, reachable via a tab switcher in the left-aside header, with past bookings rendered read-only.

**Architecture:** Reintroduce the two-view + `tab` state structure (removed in `2c47199`) in `App.tsx`. A new `TabSwitcher` component replaces the static section header in the left aside of both views. The existing (still-tracked) `MyReservationsView.tsx` is updated for the new header, the past-lock rule, and an empty state. The only new domain logic is a one-line pure `isPast` helper in `dates.ts`. All other pieces reuse existing components unchanged.

**Tech Stack:** React 19 + TypeScript, Vite, Tailwind CSS v4 (CSS-first, tokens in `src/index.css`), Vitest + jsdom + Testing Library.

## Global Constraints

- UI copy is in **Polish**. Exact strings: tabs `Zarezerwuj` / `Moje rezerwacje`; periods `Od początku` / `Ten tydzień` / `Ten miesiąc` / `Ten rok`; empty state `Brak rezerwacji w tym okresie`.
- Style only with semantic Tailwind token classes (`text-muted`, `text-strong`, `border-border`, `text-xs`, …) — never raw hex/px. `text-xs` = 16px in this repo's scale. See `.claude/rules/tailwind.md`.
- Drive component variation with props mapped to fixed literal class strings; never concatenate class-name fragments.
- Pure logic lives in `lib/`/`store/`; views/components hold only UI. Put date logic in `dates.ts`.
- A booking dated **today is editable**; only `date < today` (strict) is locked. List order is **newest-first (descending)**. Past cards look identical to others — only the details panel locks.
- TDD: write the failing test first, watch it fail, implement minimally, watch it pass, commit. Run the single-file command shown in each step; the final task runs the full suite.

---

### Task 1: `isPast` date helper

**Files:**
- Modify: `src/lib/dates.ts` (add exported function near `isInPeriod`)
- Test: `src/lib/dates.test.ts` (add a `describe` block)

**Interfaces:**
- Consumes: `toISODate(d: Date): string` (already exported from `dates.ts`).
- Produces: `isPast(iso: string, today: Date): boolean` — `true` iff `iso` is strictly before `today`'s ISO date. Consumed by Task 4.

- [ ] **Step 1: Write the failing test**

Add to the end of `src/lib/dates.test.ts`:

```ts
describe('isPast', () => {
  const today = new Date(2026, 5, 28); // 2026-06-28
  it('is true for a date before today', () => {
    expect(isPast('2026-06-27', today)).toBe(true);
    expect(isPast('2025-12-31', today)).toBe(true);
  });
  it('is false for today', () => {
    expect(isPast('2026-06-28', today)).toBe(false);
  });
  it('is false for a future date', () => {
    expect(isPast('2026-06-29', today)).toBe(false);
  });
});
```

Add `isPast` to the existing import block at the top of the file:

```ts
import {
  toISODate,
  rollingDays,
  formatPolishDate,
  spotsLabel,
  reservationsLabel,
  isInPeriod,
  isPast,
} from './dates';
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npx vitest run src/lib/dates.test.ts`
Expected: FAIL — `isPast is not a function` (or an import/type error).

- [ ] **Step 3: Implement the helper**

Append to `src/lib/dates.ts` (after `isInPeriod`):

```ts
export function isPast(iso: string, today: Date): boolean {
  return iso < toISODate(today);
}
```

(ISO `YYYY-MM-DD` strings compare correctly lexicographically, so no parsing is needed.)

- [ ] **Step 4: Run the test to verify it passes**

Run: `npx vitest run src/lib/dates.test.ts`
Expected: PASS — all `isPast` cases green.

- [ ] **Step 5: Commit**

```bash
git add src/lib/dates.ts src/lib/dates.test.ts
git commit -m "Add isPast date helper"
```

---

### Task 2: `TabSwitcher` component

**Files:**
- Create: `src/components/TabSwitcher.tsx`
- Test: `src/components/TabSwitcher.test.tsx`

**Interfaces:**
- Produces:
  - `type Tab = 'reserve' | 'mine'` (exported) — consumed by `App.tsx`, `ReserveView`, `MyReservationsView`.
  - `TabSwitcher({ active, onChange }: { active: Tab; onChange: (tab: Tab) => void })` — renders two `<button>`s (`Zarezerwuj`, `Moje rezerwacje`); clicking one calls `onChange` with that tab's key; the active tab has `font-medium text-strong`, inactive `text-muted`.

- [ ] **Step 1: Write the failing test**

Create `src/components/TabSwitcher.test.tsx`:

```tsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { TabSwitcher } from './TabSwitcher';

describe('TabSwitcher', () => {
  it('renders both tabs', () => {
    render(<TabSwitcher active="reserve" onChange={() => {}} />);
    expect(screen.getByRole('button', { name: 'Zarezerwuj' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Moje rezerwacje' })).toBeInTheDocument();
  });

  it('marks the active tab as strong', () => {
    render(<TabSwitcher active="mine" onChange={() => {}} />);
    expect(screen.getByRole('button', { name: 'Moje rezerwacje' }).className).toContain('text-strong');
    expect(screen.getByRole('button', { name: 'Zarezerwuj' }).className).toContain('text-muted');
  });

  it('fires onChange with the clicked tab key', () => {
    const onChange = vi.fn();
    render(<TabSwitcher active="reserve" onChange={onChange} />);
    fireEvent.click(screen.getByRole('button', { name: 'Moje rezerwacje' }));
    expect(onChange).toHaveBeenCalledWith('mine');
  });
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npx vitest run src/components/TabSwitcher.test.tsx`
Expected: FAIL — cannot find module `./TabSwitcher`.

- [ ] **Step 3: Implement the component**

Create `src/components/TabSwitcher.tsx`:

```tsx
export type Tab = 'reserve' | 'mine';

const TABS: { key: Tab; label: string }[] = [
  { key: 'reserve', label: 'Zarezerwuj' },
  { key: 'mine', label: 'Moje rezerwacje' },
];

type Props = { active: Tab; onChange: (tab: Tab) => void };

export function TabSwitcher({ active, onChange }: Props) {
  return (
    <div className="flex shrink-0 items-center gap-4 p-8 text-xs">
      {TABS.map((t) => (
        <button
          key={t.key}
          onClick={() => onChange(t.key)}
          className={active === t.key ? 'font-medium text-strong' : 'text-muted'}
        >
          {t.label}
        </button>
      ))}
    </div>
  );
}
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `npx vitest run src/components/TabSwitcher.test.tsx`
Expected: PASS — all three cases green.

- [ ] **Step 5: Commit**

```bash
git add src/components/TabSwitcher.tsx src/components/TabSwitcher.test.tsx
git commit -m "Add TabSwitcher component"
```

---

### Task 3: Wire tab navigation into App and both views

This is the cohesive "navigation works end to end" task. `onNavigate` becomes a **required** prop on both views, and `App.tsx` supplies it from `tab` state — all call sites change together so the typecheck stays green. The static `Wybierz dzień` / `Moje rezerwacje` section headers in the left aside are replaced by `<TabSwitcher>`.

**Files:**
- Modify: `src/App.tsx` (add `tab` state + view switch; keep brand/logo block)
- Modify: `src/views/ReserveView.tsx` (add `onNavigate` prop; swap left-aside header for `TabSwitcher`)
- Modify: `src/views/MyReservationsView.tsx` (add `onNavigate` prop; swap left-aside header for `TabSwitcher`)
- Modify: `src/App.test.tsx` (update assertions to the new design)
- Modify: `src/views/ReserveView.test.tsx` (pass `onNavigate` in the render helper)
- Modify: `src/views/MyReservationsView.test.tsx` (pass `onNavigate` in the render helper)

**Interfaces:**
- Consumes: `TabSwitcher`, `type Tab` from `src/components/TabSwitcher` (Task 2).
- Produces: `ReserveView({ onNavigate }: { onNavigate: (tab: Tab) => void })` and `MyReservationsView({ onNavigate }: { onNavigate: (tab: Tab) => void })`. `App` renders exactly one of them based on `tab` state (default `'reserve'`).

- [ ] **Step 1: Update `App.test.tsx` to the new design (failing test)**

Replace the body of the two `it(...)` blocks in `src/App.test.tsx` so the file reads:

```tsx
import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import App from './App';

describe('App', () => {
  beforeEach(() => localStorage.clear());

  it('shows the brand and defaults to the Reserve view (spot grid visible)', () => {
    render(<App />);
    expect(screen.getByText('Tonikowy parking')).toBeInTheDocument();
    expect(screen.getByText('Wybierz miejsce')).toBeInTheDocument();
  });

  it('switches to My reservations when its tab is clicked', () => {
    render(<App />);
    fireEvent.click(screen.getByRole('button', { name: 'Moje rezerwacje' }));
    expect(screen.getAllByText('Ten tydzień').length).toBeGreaterThan(0);
    expect(screen.queryByText('Wybierz miejsce')).toBeNull();
  });
});
```

(`Wybierz miejsce` is the spot-grid section header unique to `ReserveView`; `Wybierz dzień` no longer exists after the header becomes a tab switcher.)

- [ ] **Step 2: Run the test to verify it fails**

Run: `npx vitest run src/App.test.tsx`
Expected: FAIL — the "switches" test can't find a `Moje rezerwacje` button (App still renders only `ReserveView` with a static header).

- [ ] **Step 3: Add `onNavigate` + `TabSwitcher` to `ReserveView`**

In `src/views/ReserveView.tsx`:

Add the import (next to the other component imports):

```tsx
import { TabSwitcher, type Tab } from '../components/TabSwitcher';
```

Change the function signature:

```tsx
export function ReserveView({ onNavigate }: { onNavigate: (tab: Tab) => void }) {
```

Replace the left-aside header line:

```tsx
        <SectionHeader>Wybierz dzień</SectionHeader>
```

with:

```tsx
        <TabSwitcher active="reserve" onChange={onNavigate} />
```

(Leave the `SectionHeader` import — it is still used for `Wybierz miejsce` and `Szczegóły`.)

- [ ] **Step 4: Add `onNavigate` + `TabSwitcher` to `MyReservationsView`**

In `src/views/MyReservationsView.tsx`:

Add the import:

```tsx
import { TabSwitcher, type Tab } from '../components/TabSwitcher';
```

Change the function signature:

```tsx
export function MyReservationsView({ onNavigate }: { onNavigate: (tab: Tab) => void }) {
```

Replace the left-aside header line:

```tsx
        <SectionHeader>Moje rezerwacje</SectionHeader>
```

with:

```tsx
        <TabSwitcher active="mine" onChange={onNavigate} />
```

(Leave the `SectionHeader` import — it is still used for `Szczegóły`, and for date groups in Task 4.)

- [ ] **Step 5: Wire `tab` state into `App.tsx`**

Replace the contents of `src/App.tsx` with (keep the existing brand/logo block and its SVG verbatim):

```tsx
import { useState } from 'react';
import { BookingsProvider } from './store/BookingsProvider';
import { ReserveView } from './views/ReserveView';
import { MyReservationsView } from './views/MyReservationsView';
import type { Tab } from './components/TabSwitcher';

export default function App() {
  const [tab, setTab] = useState<Tab>('reserve');

  return (
    <BookingsProvider>
      <div className="grid h-full grid-cols-[302px_1fr_302px] grid-rows-[196px_1fr]">
        {/* col1, row1: brand + logo */}
        <div className="col-start-1 row-start-1 flex flex-col border-r border-b border-border p-8">
          <p className="text-xs text-muted">Tonikowy parking</p>
          <svg className="mt-12 shrink-0 fill-strong" width="48" height="48" viewBox="0 0 48 48" aria-hidden>
            <path d="M44.5572 3.43174C41.2205 0.0949886 35.9292 -0.846451 29.6491 0.774254C23.5118 2.35921 17.1243 6.23222 11.6783 11.6902C6.23222 17.1362 2.35921 23.5118 0.774255 29.6491C-0.846451 35.9174 0.0949883 41.2085 3.43174 44.5572C6.76848 47.9059 8.87779 47.9892 12.6555 47.9892C16.4331 47.9892 16.3259 47.7271 18.3399 47.2147C24.4771 45.6298 30.8645 41.7566 36.3106 36.2988C41.7566 30.8527 45.6298 24.4651 47.2265 18.3279C48.8472 12.0596 47.9059 6.76848 44.5692 3.41983L44.5572 3.43174ZM45.8681 17.9943C44.3426 23.8932 40.6008 30.0542 35.3215 35.3215C30.0422 40.5888 23.8932 44.3426 17.9943 45.8681C12.2265 47.3578 7.40009 46.5473 4.43275 43.5682C1.45352 40.5888 0.643169 35.7744 2.13279 30.0065C3.65815 24.1078 7.40009 17.9466 12.6793 12.6793C17.9585 7.41202 24.1078 3.65815 30.0065 2.13279C31.8895 1.64419 33.677 1.40586 35.3335 1.40586C38.7298 1.40586 41.5661 2.43072 43.5682 4.43275C46.5473 7.41202 47.3578 12.2265 45.8681 17.9943Z" />
            <path d="M35.748 15.9494L34.8185 14.9724L33.8412 13.9478L27.7279 19.7618L24.5938 11.9344L22.0317 12.959L25.1659 20.7864H16.7288V17.248H13.9641V33.9751H16.7288V23.5505H25.3207L22.711 31.7352L23.998 32.1403L25.3565 32.5812L28.014 24.1819L35.748 28.3994L36.3914 27.2081L37.0706 25.969L29.5392 21.8587L35.748 15.9494Z" />
          </svg>
        </div>

        {tab === 'reserve' ? (
          <ReserveView onNavigate={setTab} />
        ) : (
          <MyReservationsView onNavigate={setTab} />
        )}
      </div>
    </BookingsProvider>
  );
}
```

- [ ] **Step 6: Update the view test render helpers to pass `onNavigate`**

In `src/views/ReserveView.test.tsx`, change the render helper:

```tsx
function renderView() {
  return render(
    <BookingsProvider>
      <ReserveView onNavigate={() => {}} />
    </BookingsProvider>,
  );
}
```

In `src/views/MyReservationsView.test.tsx`, change the render helper:

```tsx
function renderView() {
  return render(
    <BookingsProvider>
      <MyReservationsView onNavigate={() => {}} />
    </BookingsProvider>,
  );
}
```

- [ ] **Step 7: Run the affected tests to verify they pass**

Run: `npx vitest run src/App.test.tsx src/views/ReserveView.test.tsx src/views/MyReservationsView.test.tsx`
Expected: PASS — App switches views; both view suites still green with the new prop.

- [ ] **Step 8: Commit**

```bash
git add src/App.tsx src/App.test.tsx src/views/ReserveView.tsx src/views/ReserveView.test.tsx src/views/MyReservationsView.tsx src/views/MyReservationsView.test.tsx
git commit -m "Wire tab navigation between Reserve and Moje rezerwacje views"
```

---

### Task 4: Past-lock, date-group headers, and empty state in `MyReservationsView`

**Files:**
- Modify: `src/views/MyReservationsView.tsx` (details status from `isPast`; date-group `SectionHeader`; card height; empty state)
- Modify: `src/views/MyReservationsView.test.tsx` (add past-read-only and empty-state tests)

**Interfaces:**
- Consumes: `isPast` from `src/lib/dates` (Task 1); `SectionHeader`, `ParkingSpotCard`, `ParkingSpotDetails` (existing). The details status passed to `ParkingSpotDetails` is one of its existing values: `'none' | 'booked' | 'booked-user'`.
- Seed facts (today = `2026-06-28`): the user's own bookings are `09` (today → editable, period `week`/`month`/`year`/`all`), `02` (today−10 = `2026-06-18`, **past**, period `month`/`year`/`all`), `03` (`2026-01-15`, past, period `year`/`all`).

- [ ] **Step 1: Write the failing tests**

Add the `STORAGE_KEY` import at the top of `src/views/MyReservationsView.test.tsx`:

```tsx
import { STORAGE_KEY } from '../store/storage';
```

Add these two cases inside the `describe('MyReservationsView', …)` block:

```tsx
  it('renders a past booking as read-only (no Zapisz/Usuń)', () => {
    renderView();
    fireEvent.click(screen.getByText('Ten miesiąc')); // includes the past spot 02
    fireEvent.click(screen.getByText('02'));
    expect(screen.queryByRole('button', { name: 'Zapisz' })).toBeNull();
    expect(screen.queryByRole('button', { name: 'Usuń' })).toBeNull();
  });

  it('shows an empty state when the period has no reservations', () => {
    localStorage.setItem(STORAGE_KEY, '[]');
    renderView();
    expect(screen.getByText('Brak rezerwacji w tym okresie')).toBeInTheDocument();
  });
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `npx vitest run src/views/MyReservationsView.test.tsx`
Expected: FAIL — the past booking still shows `Zapisz`/`Usuń` (status is hard-coded `'booked-user'`), and there is no empty-state text.

- [ ] **Step 3: Compute the details status from `isPast`**

In `src/views/MyReservationsView.tsx`, add `isPast` to the `dates` import:

```tsx
import { formatPolishDate, reservationsLabel, isPast, type Period } from '../lib/dates';
```

Add a derived status just after the `selected` declaration:

```tsx
  const selected = list.find((r) => r.id === selectedId) ?? null;

  const detailsStatus = !selected
    ? 'none'
    : isPast(selected.date, today)
      ? 'booked'
      : 'booked-user';
```

Change the `ParkingSpotDetails` `status` prop from:

```tsx
          status={selected ? 'booked-user' : 'none'}
```

to:

```tsx
          status={detailsStatus}
```

- [ ] **Step 4: Replace the date-group header and card sizing, and add the empty state**

In `src/views/MyReservationsView.tsx`, replace the entire `<main>` block:

```tsx
      {/* Body: col2, row2 */}
      <main className="col-start-2 row-start-2 flex flex-col overflow-auto px-8 pt-8">
        {groups.map(([date, items]) => (
          <section key={date} className="mb-8">
            <p className="mb-4 text-xs text-muted">{formatPolishDate(date)}</p>
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
```

with:

```tsx
      {/* Body: col2, row2 */}
      <main className="col-start-2 row-start-2 flex flex-col overflow-auto">
        {list.length === 0 ? (
          <p className="p-8 text-center text-xs text-muted">Brak rezerwacji w tym okresie</p>
        ) : (
          groups.map(([date, items]) => (
            <section key={date}>
              <SectionHeader>{formatPolishDate(date)}</SectionHeader>
              <div className="flex flex-col gap-2 px-8 pb-8">
                {items.map((r) => (
                  <div key={r.id} className="h-[216px]">
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
          ))
        )}
      </main>
```

(The date group now uses `SectionHeader` to match the Figma `p-8 / strong / medium` header; cards are `h-[216px]`, mirroring `ReserveView`'s grid-cell height.)

- [ ] **Step 5: Run the tests to verify they pass**

Run: `npx vitest run src/views/MyReservationsView.test.tsx`
Expected: PASS — past booking is read-only; empty state renders; pre-existing cases (period filters, editable today booking, delete) still green.

- [ ] **Step 6: Run the full suite, lint, and typecheck**

Run: `npm test`
Expected: PASS — all test files green.

Run: `npm run lint`
Expected: no errors.

Run: `npm run build`
Expected: typecheck + build succeed.

- [ ] **Step 7: Commit**

```bash
git add src/views/MyReservationsView.tsx src/views/MyReservationsView.test.tsx
git commit -m "Lock past bookings, add date-group headers and empty state to Moje rezerwacje"
```

---

## Notes for the implementer

- Do **not** modify any component API (`ParkingSpotCard`, `ParkingSpotDetails`, `ListItem`, `SectionHeader`, `ViewHeader`, `InfoField`, `AlertDialog`, `Button`). Past-lock is achieved purely by passing the existing `'booked'` status.
- `MyReservationsView` already sorts descending and groups by date — preserve that logic; Task 4 only changes presentation and the details status.
- After Task 3, clicking a tab unmounts the other view, so selection/form state is discarded on tab change automatically (no extra reset needed). Period changes already reset selection in the existing code.
- Keep the `BookingsProvider`-wrapped render helpers in the view tests; they exercise the real store and seed data.
