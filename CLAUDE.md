# Aqarly

Real estate platform front end. Next.js 16 (App Router) + Tailwind CSS v4,
plain JavaScript (no TypeScript).

## Conventions

- Routes live in `src/app/<route>/page.js`; the shared shell is `src/app/layout.js`.
- Components are `.jsx` under `src/components` — `layout/` for structural pieces,
  `ui/` for generic primitives. Keep them server components unless they need
  state or browser APIs, in which case add `"use client"`.
- Import with the `@/` alias (`@/lib/site`), never long relative paths.
- Styling is Tailwind utility classes only. Colors come from the `background` /
  `foreground` theme tokens in `src/app/globals.css` so dark mode keeps working —
  avoid hard-coded hex values.
- Site-wide strings (name, nav, contact) belong in `src/lib/site.js`.

## Data

All property reads go through `src/lib/properties.js`. It currently reads
`src/data/properties.json`; keep that the single seam so the source can change
without touching pages.

## Naming

`Aqarly` is a placeholder codename. Do not add the real company name anywhere
in this repo.
