# Tonik Parking Spot Booking System — Design Spec

**Date:** 2026-06-05
**Status:** Approved design → ready for implementation planning
**Source design:** [Figma — Tonik Parking Spot Booking System](https://www.figma.com/design/9s7kDgXgOB8M9ashWWd9Ek/-R-D--Tonik-Parking-Spot-Booking-System--Copy-?node-id=6003-2)

## 1. Overview

A web app for booking office parking spots at Tonik. The UI is in Polish, matching
the Figma design exactly. Users pick a day, see the 01–10 spot grid for that day,
and reserve a free spot (for themselves or a guest). A second view lists the
reservations they created, filterable by period, with edit/delete.

**Scope for this phase:** a realistic, fully interactive **front-end prototype**.
All data lives in the browser (`localStorage`) — no backend. The app is fully
clickable: book, edit, delete, with data surviving refreshes.

**Not in scope (planned later):** a shared backend so all users see the same live
data. See §10.

## 2. Goals & constraints

- Faithful to the Figma: same layout, components, Polish copy, and design tokens.
- Fully interactive prototype — feels like the real product.
- Single hardcoded current user; no authentication.
- Browser-only persistence; resettable demo data.
- Deployable to Vercel as a static site with zero/near-zero config.
- Built behind a clean store boundary so a real backend can be added later
  without rewriting the UI.

## 3. Tech stack

| Concern | Choice | Rationale |
|---|---|---|
| Framework | **React + Vite + TypeScript** | Components map 1:1 to Figma components; Vite = fast dev/build; TS documents data shapes and prevents errors. |
| Styling | **Tailwind CSS** | Figma variables baked into the Tailwind theme; utility classes reference real tokens (`bg-surface`, `text-strong`). |
| State | **React Context** (`BookingsProvider`) | One provider owns all app state; components read/dispatch through it. |
| Persistence | **`localStorage`** behind a store module | Survives refresh; isolated so it can be swapped for an API later. |
| Routing | **None** (in-app tab toggle) | Only two views; a tab toggle matches the Figma header. |
| Testing | **Vitest** | Unit tests on store/derived logic (the brittle parts). |
| Hosting | **Vercel** (static) | Vite build output deploys out of the box. |

## 4. Design tokens (from Figma variables)

Mapped into the Tailwind theme. Warm neutral (stone) palette.

**Colors**
- `Content/Strong` `#1b1917`
- `Content/Default` `#45403c`
- `Content/Muted` `#78716b`
- `Content/On Accent` `#f5f5f4`
- `Content/On Accent Muted` `#d7d3d1`
- `Background/Default` `#f5f5f4`
- `Background/Muted` `#e7e5e4`
- `Background/Accent` `#0c0a09`
- `Border/Default` `#e7e5e4`

**Type scale** (px): `text-xs` 16, `text-sm` 20, `text-4xl` 36, `text-5xl` 48 · `font-normal` 400

Additional tokens (spacing, radii, remaining type steps, icon colors) will be
pulled from Figma per-component during implementation and added to the theme.

## 5. Data model

All persisted to `localStorage`. Three core types:

```ts
type ParkingSpot = {
  id: string;        // "01".."10" — fixed set
};

type DayRef = {
  date: string;      // ISO date, e.g. "2025-04-03"
};

type Reservation = {
  id: string;
  spotId: string;    // which spot
  date: string;      // ISO date
  bookedBy: string;  // who CREATED it — always the current user at creation
  personName: string;// who it's FOR — defaults to current user, editable (guest)
  plates: string;    // licence plates (required)
  note: string;      // optional free text
};
```

**Current user:** a single constant `CURRENT_USER = "Robert Makłowicz"` (one place
to change). Used to pre-fill new bookings and to define "my" reservations.

**`bookedBy` vs `personName`:** `bookedBy` is the creator (the current user);
`personName` is the occupant and may be a guest. *Moje rezerwacje* filters on
`bookedBy === CURRENT_USER`, so guest bookings the user made still appear as theirs
and remain editable by them.

**Derived (computed, never stored):**
- A spot's status for a given day: *Wolne* (no reservation), *Zarezerwowane* +
  `personName` (reserved), *Wybrane* (currently selected in the UI).
- Whether a reservation is editable by the current user (`bookedBy === CURRENT_USER`).
- Per-day available-spot counts (sidebar "2 miejsca / Full" labels).
- Period filter counts for *Moje rezerwacje* (this week / month / year / all time).

**Seed data:** on first load (empty/corrupt storage) we generate:
- A rolling list of days **relative to today** (e.g. today + the next ~7 days), so the
  sidebar always looks current. (The Figma shows April 2025 as illustrative copy; we do
  not hardcode those dates.)
- Reservations by other people (so spots show as *Zarezerwowane* by others, view-only).
- Several reservations created by the current user spread so each **period filter is
  non-trivially populated** — at least one this week, one earlier this month, one earlier
  this year — some for the user, some for guests. This keeps the week/month/year/all-time
  counts meaningful regardless of the actual run date.
- A **"reset demo data"** affordance returns to this clean seeded state.

## 6. Components (1:1 with Figma)

- **Button** — variants Primary / Secondary, states Default / Hover. (*Zarezerwuj*, *Zapisz*, *Usuń*, dialog buttons.)
- **ListItem** — Default / Hover / Active. (Day-picker rows; period-filter rows.)
- **InfoField** — Default / Active / Filled / View-Only. (Form fields: name, plates, note, read-only spot number.)
- **ParkingSpotCard** — Default/Active × Booked(True/False). (The 01–10 grid tiles.)
- **ParkingSpotDetails** — right panel; statuses:
  - **None** — empty prompt ("Wybierz miejsce aby zobaczyć szczegóły lub je zarezerwować").
  - **Available** — booking form for a free, selected spot.
  - **Booked** — someone else's reservation, view-only.
  - **Booked (User)** — a reservation the current user created (incl. guest), editable.
- **Toast** — transient confirmation ("Rezerwacja potwierdzona").
- **AlertDialog** — confirmation modal; used for destructive **delete** (*Usuń*).

## 7. Screens & interactions

### App shell
- Left column: brand header ("Tonikowy parking" + logo) and the contextual aside.
- Header tabs toggle the two views: **Zarezerwuj** (Reserve) / **Moje rezerwacje** (My reservations).

### Reserve view (Zarezerwuj)
1. Left aside: **day picker** with available-spot count per day; selecting a day drives the grid.
2. Center: header ("Wybrany dzień" + selected date) and the **01–10 grid** for that day. Each tile renders *Wolne*, *Zarezerwowane* + name, or *Wybrane*.
3. Click a **free** spot → it becomes *Wybrane*; right panel shows the **booking form** (name pre-filled to current user but editable for a guest; plates required; optional note) → **Zarezerwuj** saves it, a **toast** appears, the tile flips to *Zarezerwowane*.
4. Click a spot **booked by someone else** → right panel shows **view-only** details.
5. No per-day limit — the user can book additional free spots (e.g. for guests) by repeating the flow.

### My reservations view (Moje rezerwacje)
1. Left aside: **period filter** (Od początku / Ten tydzień / Ten miesiąc / Ten rok) with live counts.
2. Center: the current user's reservations (`bookedBy === CURRENT_USER`) grouped by day, within the selected period.
3. Click one → right panel shows the **editable** form → **Zapisz** updates it; **Usuń** opens the **AlertDialog** → confirming deletes it.

## 8. Validation & error handling

- **Required fields:** `personName` and `plates` (the `*`-marked fields). The
  primary action (**Zarezerwuj** / **Zapisz**) is disabled until both are non-empty.
- **No double-booking:** a spot already reserved for a given day cannot be booked
  again for that day; booked tiles are not selectable for new bookings.
- **Storage resilience:** empty or corrupt `localStorage` falls back to fresh seed data.
- **Delete is guarded** by the confirmation dialog.

## 9. Testing

- **Vitest unit tests** on the store + derived logic:
  - availability/status computation per spot per day,
  - per-day available counts,
  - period filtering and counts (week/month/year/all),
  - create / edit / delete reservation,
  - `bookedBy` vs `personName` ("my reservations" includes guest bookings I made),
  - validation rules and double-booking prevention,
  - localStorage load/save + corrupt-data fallback.
- Visual components verified by running the app against the Figma.

## 10. Project structure

```
src/
  components/    # Button, ListItem, InfoField, ParkingSpotCard, ParkingSpotDetails, Toast, AlertDialog
  views/         # ReserveView, MyReservationsView
  store/         # BookingsProvider (context) + localStorage persistence + derived selectors
  lib/           # date helpers, formatting, seed data, constants (CURRENT_USER)
  types.ts       # ParkingSpot, DayRef, Reservation
  App.tsx        # layout shell + view tab toggle
  index.css      # Tailwind entry + token layer
tailwind.config  # Figma tokens mapped into theme
```

## 11. Future phase (out of scope now)

Make bookings **shared/live** across users:
- Replace the `localStorage` store implementation with calls to a small API
  (Vercel serverless functions) backed by a hosted store (Vercel Postgres or KV).
- The UI and the store's public interface stay the same — only the store's internals change.
- Likely add real per-user identity (replacing the hardcoded `CURRENT_USER`).

Git will also be initialized in a later phase (deferred for now per project setup).
