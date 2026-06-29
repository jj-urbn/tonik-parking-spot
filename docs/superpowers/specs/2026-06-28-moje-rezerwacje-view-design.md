# "Moje rezerwacje" view + tab switcher — design

**Date:** 2026-06-28
**Status:** Approved (design)
**Figma:** https://www.figma.com/design/9s7kDgXgOB8M9ashWWd9Ek/JU---Tonik-Parking-Spot-Booking-System?node-id=6005-1317

## Summary

Add a second view, **"Moje rezerwacje"**, that lists the current user's past and
upcoming bookings as a vertically-stacked, date-grouped list of Parking Spot Cards.
The user switches between the existing **"Zarezerwuj"** view and the new view via a
tab switcher that lives in the left-aside header (replacing the static section
header there). Selecting a card populates the existing details panel. **Bookings
dated strictly in the past are read-only — they cannot be edited or deleted.**

This re-introduces the two-view + tab structure that was removed in commit
`2c47199`, but relocates the tab switcher from the brand column into the left-aside
header per the new Figma design. The supporting logic (`filterReservations`,
`Period`, `reservationsLabel`, Polish plural forms) already exists in the codebase.

## Decisions (resolved during brainstorming)

- **"Past" boundary:** A booking dated *today* is **editable**. Only strictly past
  dates (`date < today`) are locked.
- **Past card appearance:** Cards look identical regardless of past/future. The lock
  is felt only in the details panel (no Zapisz/Usuń). Matches Figma.
- **List order:** Newest first (descending by date), grouped by date.

## Architecture

The clean split between pure logic (`lib/`, `store/`) and the React shell
(`views/`, `components/`) is preserved. The only new domain logic is a single pure
date helper.

- **`App.tsx`** — owns `tab: 'reserve' | 'mine'` state (`useState`, default
  `'reserve'`). Renders `<ReserveView>` or `<MyReservationsView>` and passes an
  `onNavigate: (tab: Tab) => void` callback down. The brand column (col1/row1) is
  unchanged — it shows only brand text + logo, no nav.
- **`TabSwitcher`** (new component) — renders the two tabs and sits in the
  left-aside header slot of **both** views, replacing the existing `<SectionHeader>`
  in that position.
- **`MyReservationsView`** (new view) — adapts the removed version, adding the
  past-lock rule and an empty state.
- **`dates.ts`** — gains one pure helper: `isPast(iso, today)`.

## Components

### New: `TabSwitcher`

```tsx
type Tab = 'reserve' | 'mine';
type Props = { active: Tab; onChange: (tab: Tab) => void };
```

- Layout matches the Figma header: `flex gap-4 items-center p-8`.
- Each tab is a `<button>` with `text-xs` (repo scale). Active tab:
  `font-medium text-strong`. Inactive: `text-muted`.
- Tab labels: `Zarezerwuj` (`'reserve'`), `Moje rezerwacje` (`'mine'`).
- Clicking a tab calls `onChange(tab)`. The active tab is non-interactive visually
  but clicking it is a harmless no-op (still calls `onChange` with the current tab).
- Variation is driven by props mapped to fixed literal class strings (per the
  Tailwind rules), not concatenated fragments.

### New: `MyReservationsView`

State (local UI only):
- `period: Period` — default `'week'`.
- `selectedId: string | null`.
- `personName`, `plates`, `note` — form fields for the selected booking.
- `confirmDelete: boolean`.

Derived data (memoized):
- `list = filterReservations(reservations, period, today)` sorted by `date`
  **descending** (`b.date.localeCompare(a.date)`). `filterReservations` already
  restricts to `bookedBy === CURRENT_USER`.
- `groups: [date, Reservation[]][]` — `list` grouped by `date` into a `Map`,
  preserving descending order.
- `selected = list.find(r => r.id === selectedId) ?? null`.
- `activePeriodLabel` — label for the current period.

Layout (places itself into the fixed grid cells, like `ReserveView`):
- **Header (col2/row1):** `<ViewHeader label="Wybrany okres">{activePeriodLabel}</ViewHeader>`.
- **Left aside (col1/row2):** `<TabSwitcher active="mine" onChange={onNavigate} />`
  followed by the period list — one `<ListItem>` per period with
  `reservationsLabel(filterReservations(reservations, p.key, today).length)` as
  trailing text, `active={p.key === period}`. Selecting a period sets `period` and
  clears selection + form fields.
- **Main (col2/row2):** for each `[date, items]` group: a
  `<SectionHeader>{formatPolishDate(date)}</SectionHeader>` followed by a `px-8`
  container with `flex flex-col gap-2` of `<ParkingSpotCard>` (one per booking),
  `state={selectedId === r.id ? 'selected' : 'booked'}`, `personName={r.personName}`,
  card height matching Figma (~216px, same as ReserveView grid cells). If `list` is
  empty, render a centered muted empty state: `Brak rezerwacji w tym okresie`.
- **Details aside (col3/row2):** `<SectionHeader>Szczegóły</SectionHeader>` +
  `<ParkingSpotDetails>` with status:
  - `'none'` when nothing selected,
  - `'booked'` (read-only, no buttons) when the selected booking
    `isPast(selected.date, today)`,
  - `'booked-user'` (editable, Zapisz + Usuń) otherwise.
- **`<AlertDialog>`** — delete confirmation, only reachable from a `'booked-user'`
  booking via the Usuń button.

Actions delegate to `useBookings()`:
- Submit (editable only) → `edit(selected.id, { personName, plates, note })`.
- Confirmed delete → `remove(selected.id)` then clear selection.

### Reused unchanged

`ListItem`, `SectionHeader`, `ViewHeader`, `ParkingSpotCard`, `ParkingSpotDetails`,
`InfoField`, `AlertDialog`, `Button` — no API changes.

### Modified

- **`App.tsx`** — add `tab` state + view switch (as above).
- **`ReserveView.tsx`** — replace `<SectionHeader>Wybierz dzień</SectionHeader>`
  with `<TabSwitcher active="reserve" onChange={onNavigate} />`. Accept an
  `onNavigate` prop. No other behavior changes.

## Data flow & new logic

The single new pure helper, added to `src/lib/dates.ts`:

```ts
export function isPast(iso: string, today: Date): boolean {
  return iso < toISODate(today);
}
```

ISO date strings (`YYYY-MM-DD`) compare correctly lexicographically, so this needs
no parsing. Today is **not** past, so today's bookings remain editable.

The view computes the details status from this helper; no changes to
`reservations.ts` or `ParkingSpotDetails` are required — reusing the existing
`'booked'` status yields exactly the read-only render needed for past bookings.

## Edge cases

- **Empty period:** main column shows a centered muted line
  `Brak rezerwacji w tym okresie`.
- **Past booking selected:** fields shown read-only, no action buttons.
- **Period/tab change with a selection active:** selection and form fields are
  cleared.
- **Guest bookings:** bookings the user made on behalf of a guest (`bookedBy ===
  CURRENT_USER`, `personName` = guest) appear in the list — this is the existing
  `filterReservations` definition and is intended.

## Testing

Vitest + jsdom + Testing Library, following existing patterns.

- **`dates.test.ts`** — extend with `isPast`: a date before today → `true`; today →
  `false`; a future date → `false`.
- **`TabSwitcher.test.tsx`** (new) — renders both tab labels; the active tab has the
  active styling; clicking the inactive tab fires `onChange` with the other tab.
- **`MyReservationsView.test.tsx`** (new):
  - Period filtering + counts reflect seed data; default period is `week`.
  - Bookings are grouped by date and ordered newest-first.
  - Selecting a card shows its details.
  - A **past** booking renders read-only (no Zapisz/Usuń buttons).
  - A **today/future** booking is editable and deletable (Usuń → AlertDialog →
    `remove`).
  - Empty period shows the empty state.
- **View switching** — toggling the tab switches between `ReserveView` and
  `MyReservationsView` (covered via `App` or a focused render test).

## Out of scope

- No visual distinction for past cards in the list.
- No changes to seeding, storage, or the booking domain functions beyond adding
  `isPast`.
- No backend; all state remains in `localStorage`.
