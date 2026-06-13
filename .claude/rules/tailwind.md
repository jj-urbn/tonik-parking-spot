---
paths:
  - "src/**/*.tsx"
  - "**/*.css"
---

# Tailwind CSS rules

How to write elegant, clean, "native" Tailwind in this repo. This project is
**Tailwind v4, CSS-first**: tokens live in the `@theme` block of `src/index.css`,
there is no `tailwind.config.js`, and there is no `cn`/`clsx`/`cva`/`tailwind-merge`.
Prefer the native idioms below over reaching for tooling we don't have.

## Tokens are the source of truth

- **Style with semantic token classes, never raw values.** Use `text-muted`,
  `bg-surface`, `border-border`, `text-4xl` — not `text-[#78716b]`, `bg-[#f5f5f4]`,
  or `text-[36px]`. Every color and size already has a token in the `@theme` block.
- **Need a value that has no token?** Add it to `@theme` in `src/index.css` with a
  semantic name (`--color-error`, not `--color-bright-red`) and use the generated
  class. Don't sprinkle one-off arbitrary values across components.
- **Arbitrary values (`w-[37px]`, `top-[13px]`) are debt.** Allow them only for a
  genuine one-off with no reasonable token (e.g. the fixed `grid-cols-[302px_1fr_302px]`
  layout) and keep them rare. If you write the same arbitrary value twice, it's a token.

## Keep class strings minimal

- Use the fewest classes that express the intent. Each class is cognitive load.
- Collapse redundancy: `py-4` over `pt-4 pb-4`; `border-2 border-black/50` over
  `border border-2 border-black border-opacity-50`.
- Drop CSS defaults: `flex justify-between`, not `flex flex-row justify-between`.
- Use the slash opacity syntax (`text-strong/60`) instead of separate opacity utilities.

## Order classes consistently

Group in a predictable order so diffs stay readable: **layout/position → box model
(display, size, margin, padding) → typography → visual (bg, border, shadow) → states
& responsive modifiers last**. Mobile-first: write the base style unprefixed, then
layer `sm:`/`md:`/`lg:` overrides.

## Components, not repetition

- **Extract a component before copy-pasting a long class list.** This repo already
  centralizes UI in `src/components/` (`Button`, `ListItem`, `ParkingSpotCard`…).
  Reuse those; don't re-spell their class strings inline.
- **Drive variation with props mapped to fixed class sets**, not free-form className
  pass-through. Define the allowed looks (e.g. `variant: "primary" | "secondary"`)
  and map each to a literal class string inside the component. This keeps the UI
  consistent and changes propagate from one place.

  ```tsx
  const variants = {
    primary: "bg-accent text-on-accent",
    secondary: "bg-surface-muted text-strong",
  } as const
  <button className={`rounded-md px-4 py-2 ${variants[variant]}`} />
  ```

## Conditional classes must stay literal

Tailwind scans for **complete literal class strings** at build time. Never assemble
class names from fragments — `` `bg-${color}-500` `` produces nothing. Switch on whole
strings instead:

```tsx
// good — full strings, compiler sees them
className={isActive ? "bg-accent text-on-accent" : "bg-surface text-muted"}

// bad — fragment, silently purged
className={`bg-${tone}-500`}
```

For more than a couple of conditions, a lookup object (as in the variants example)
beats a chain of ternaries inside the template literal.

## Don't reach for `@apply`

`@apply` re-introduces the naming and indirection problems Tailwind exists to remove,
and it grows the bundle. Solve repetition with a **component** (our default) or, for a
genuinely verbose CSS property that has no utility (complex `clip-path`, intricate
shadow), a v4 `@utility` in `index.css` — not `@apply` over existing utilities.

## Anti-patterns — reject on sight

- Raw hex / px where a token exists (`bg-[#0c0a09]` → `bg-accent`).
- Dynamically concatenated class names.
- `!important` (`!`) except to override a third-party inline style we don't control.
- Free-form `className` props that let callers pass arbitrary utilities into a primitive.
- Long duplicated class strings that should be a component.
