# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

A single-page parking-spot reservation demo for Tonik. The UI is in **Polish**. There is no backend — all state lives in `localStorage` and is seeded on first load. A fixed lot of 10 spots (ids `"01".."10"`) can be reserved per day.

## Commands

```bash
npm run dev          # Vite dev server (HMR)
npm run build        # tsc -b (typecheck) then vite build
npm run lint         # ESLint over the repo
npm test             # vitest run (one-shot, CI mode)
npm run test:watch   # vitest in watch mode
```

Run a single test file or filter by name:

```bash
npx vitest run src/lib/dates.test.ts
npx vitest run -t "freeCountForDay"
```

## Architecture

The app is deliberately split into **pure logic** and **React shell** so the core booking rules are unit-testable without rendering.

- **`src/store/reservations.ts`** — the heart of the domain. Pure, side-effect-free functions over a `Reservation[]` array: `spotStatus`, `freeCountForDay`, `addReservation`, `updateReservation`, `deleteReservation`, `validateBooking`, etc. These take state in and return new state out; they never touch React or storage. **Put booking rules here, not in components.**
- **`src/store/BookingsProvider.tsx`** — the only stateful owner. Holds `reservations` in `useState`, persists every change to `localStorage` via a `useEffect`, and exposes `book/edit/remove/resetDemo` plus `today` through the `useBookings()` context hook. The action methods are thin wrappers that call the pure functions in `reservations.ts`.
- **`src/store/storage.ts`** — `localStorage` load/save under key `tonik-parking:reservations:v1`. On missing/corrupt data it falls back to seed data and re-saves.
- **`src/lib/seed.ts`** — deterministic seed (no `Math.random`, dates derived from `today`) so tests and the "Reset demo" button are reproducible.
- **`src/lib/dates.ts`** — date helpers and **Polish-language formatting** (`formatPolishDate`, `spotsLabel`, `reservationsLabel` with correct one/few/many plural forms) and period filtering (`week`/`month`/`year`/`all`).
- **`src/lib/constants.ts`** — `CURRENT_USER` (the single hardcoded "logged-in" user) and `SPOT_IDS`.
- **`src/views/`** — `ReserveView` (day list → spot grid → details panel) and `MyReservationsView`. Views hold only local UI state (selection, form fields, modal open flags) and delegate all data mutation to `useBookings()`.
- **`src/components/`** — presentational components (`ParkingSpotCard`, `ListItem`, `ParkingSpotDetails`, `Toast`, `AlertDialog`, `Button`, `InfoField`). Each has a colocated `*.test.tsx`.

### Key domain concepts

- A `Reservation` distinguishes **`bookedBy`** (creator = `CURRENT_USER` at creation, immutable) from **`personName`** (occupant, editable — supports booking on behalf of a guest). Ownership checks (can edit/delete) compare `bookedBy === CURRENT_USER`, surfaced via `SpotStatus.byCurrentUser`.
- `App.tsx` is a top-level tab switch (`reserve` | `mine`) wrapped in `BookingsProvider`. Layout is a fixed CSS grid (`grid-cols-[302px_1fr_302px] grid-rows-[196px_1fr]`); views place themselves into named grid cells with `col-start-*`/`row-start-*`.

## Styling

Tailwind CSS v4 via `@tailwindcss/vite` (no `tailwind.config.js`). The design tokens — semantic colors (`strong`, `muted`, `surface`, `accent`, `border`, …) and the deliberately oversized type scale (`text-xs` = 16px) — are defined in the `@theme` block of `src/index.css`. Use these token classes (`text-muted`, `border-border`, etc.) rather than raw hex/sizes.

Detailed clean/native Tailwind conventions (tokens, class minimalism, ordering, variants, conditional classes, anti-patterns) live in `.claude/rules/tailwind.md`, a path-scoped rule that loads automatically when working on `*.tsx` or `*.css` files. (Don't add an `@`-import for it — the rules directory auto-discovers it; importing would force it to load every session and defeat the scoping.)

## Testing

Vitest + jsdom + Testing Library. `src/test-setup.ts` polyfills a full in-memory `localStorage` (Node's native one is incomplete). Pure logic in `lib/` and `store/` is tested directly; components and views are tested through rendered behavior.

## Reference docs

`docs/superpowers/specs/` holds the design spec and `docs/superpowers/plans/` the implementation plan — consult these for intended behavior and visual design before non-trivial changes.
