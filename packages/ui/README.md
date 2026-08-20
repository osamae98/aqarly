# @aqarly/ui

The design system, synced from the Claude Design project
`d34fa991-3f86-41bf-9d5e-a8b903594210`. Every app renders from this package —
there is no second copy of a component or a colour anywhere in the repo.

- `styles/tokens.css` — the token layer. Each app imports it once, after
  `@import "tailwindcss"`, which is what turns the tokens into utilities
  (`bg-brand`, `text-ink-soft`, `rounded-pill`).
- `src/*.jsx` — components, imported as `@aqarly/ui/Button`.

Apps must list this package in `transpilePackages` and point a Tailwind
`@source` at `packages/ui/src`, otherwise the class names used inside these
components never make it into the app's stylesheet.
