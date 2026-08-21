# Aqarly

Real estate platform front end. Next.js 16 (App Router) + Tailwind CSS v4,
plain JavaScript (no TypeScript). A pnpm workspace: one app per system from the
platform roadmap, over shared design-system and data packages.

## Layout

```
apps/web      Public marketing site          :3000
apps/ops      Operations Admin Portal        :3001
apps/tenant   Tenant Services Portal         :3002
packages/ui   Design system + tokens
packages/core Shared data model + read seam
```

Each app runs, builds, and deploys on its own — `pnpm dev:ops` starts only the
ops portal. `pnpm build` and `pnpm lint` run every workspace.

Adding a system (Marketing & Sales, HR) means a new `apps/<name>` that consumes
the same two packages, never its own copy of a component or an entity.

## Conventions

- Routes live in `apps/<app>/src/app/<route>/page.js`; each app owns its root
  layout, since they are separate products with separate shells.
- Shared components are `.jsx` in `packages/ui/src`, imported as
  `@aqarly/ui/Button`. App-specific components live in
  `apps/<app>/src/components` and are imported with the `@/` alias. If a second
  app needs one, move it to `packages/ui` rather than copying it.
- `packages/ui` must not import from `packages/core` — the design system stays
  unaware of the domain. Components that need domain data take it as props
  (see `Timeline` and `stageSteps`).
- Keep components server components unless they need state or browser APIs, in
  which case add `"use client"`. Prefer `hover:`/`focus:` variants and URL
  search params over client state.
- Import with the `@/` alias inside an app, `@aqarly/*` across packages, never
  long relative paths.
- Styling is Tailwind utility classes only, no hard-coded hex. Colors, type,
  radii, and shadows come from the tokens in `packages/ui/styles/tokens.css`.

## Design system

`packages/ui` is synced from the Claude Design project
`d34fa991-3f86-41bf-9d5e-a8b903594210` via the `DesignSync` tool. The project
ships components as `React.createElement` with inline styles; they are ported
here as JSX + Tailwind against the tokens, keeping the same prop APIs so the
project's `.d.ts` files stay accurate.

The tokens ship light-only. The dark palette in `tokens.css` is derived from
the same scales locally and has not been reviewed by the design system owner.

A new app must import `@aqarly/ui/styles/tokens.css` after `@import
"tailwindcss"`, list both packages in `transpilePackages`, and point a Tailwind
`@source` at `packages/ui/src` — otherwise the shared components' class names
never reach its stylesheet.

## Data

All reads go through `packages/core/src` — `operations.js` for service
requests, SLA state, staff, and dashboard rollups; `properties.js` for
listings; `site.js` for site-wide strings. They currently read JSON from
`packages/core/data`; keep that the single seam so the source can change
without touching pages.

The entities there (Property, Unit, Tenant, Lease, Service Request, Staff) are
the shared model the platform roadmap mandates. Extend them in `core` rather
than redefining them in an app.

`getSignedInTenant()` is a stub standing in for a session. There is no auth
anywhere yet, and no write path — every app is read-only. The tenant portal's
`/login` screens are the designed flow rendered as navigation only: they
authenticate nobody, and every submit control on a form is disabled with the
reason stated on screen. Wire them to a real session rather than making them
look like they work.

Tenant notifications are derived from each request's `stageHistory` rather
than stored, so "unread" is a recency window until read state has somewhere to
live.

## Naming

`Aqarly` is a placeholder codename. Do not add the real company name anywhere
in this repo — including the name the design system project uses.

## Package manager

pnpm workspaces, pinned by the `packageManager` field in the root
`package.json` and run through corepack. Use `pnpm add --filter <workspace>` /
`pnpm install` — never `npm` or `yarn` in this repo; a second lockfile would
drift from `pnpm-lock.yaml`.

`onlyBuiltDependencies` in `pnpm-workspace.yaml` is deliberately empty: no
dependency is allowed to run install scripts. If a package genuinely needs one,
add it to that array by name rather than disabling the check.

Builds fetch fonts from Google at build time, so `pnpm build` needs network.
Running all three concurrently can trip a fonts.gstatic.com timeout; if that
happens, `pnpm -r --workspace-concurrency=1 build`.
