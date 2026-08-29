# @aqarly/ui

The design system, synced from the Claude Design project
`d34fa991-3f86-41bf-9d5e-a8b903594210`. Every app renders from this package —
there is no second copy of a component or a colour anywhere in the repo.

- `styles/tokens.css` — the token layer. Each app imports it once, after
  `@import "tailwindcss"`, which is what turns the tokens into utilities
  (`bg-brand`, `text-ink-soft`, `rounded-pill`).
- `src/*.jsx` — components, imported as `@aqarly/ui/Button`.

Components are ported from the project's `React.createElement` + inline-style
source into JSX + Tailwind against the tokens, keeping the same prop APIs so
the project's `.d.ts` files stay accurate. The additions below are deliberate
supersets of the documented API:

- `Sidebar` and `Tabs` accept an `href` on an item, rendering a `next/link`
  instead of a button, so an app-router shell gets real links rather than
  routing imperatively. The documented `onNavigate` / `onChange` form still
  works.
- `Sidebar` also takes `tone="brand"` for the dark rail the ops portal is
  drawn with, a `children` slot for domain content below the nav, and
  `countTone` on an item for a count that should read as an alert.
- `Badge` takes `dot={false}`. The ops screens draw every status chip without
  the leading marker.

Only components an app actually renders live here; the kit is ported as
screens need it rather than wholesale.

`Sidebar` and `Slideout` take function props or use effects, so they carry
`"use client"`; the rest render on the server.

The design system writes text on a status tint as a hard-coded stop — the 700
against the 100. That pair collapses to one colour under the derived dark
palette, where the tint *is* the 700, so the token layer names it instead:
`--color-{success,warning,danger,info}-ink` is the readable foreground for the
matching `-tint`, flipping to the 100 stop in dark mode. Use `text-danger-ink`
on `bg-danger-tint`, never `text-danger` or a raw stop.

Apps must list this package in `transpilePackages` and point a Tailwind
`@source` at `packages/ui/src`, otherwise the class names used inside these
components never make it into the app's stylesheet.
