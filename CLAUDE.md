# Aqarly

Real estate platform front end. Next.js 16 (App Router) + Tailwind CSS v4,
plain JavaScript (no TypeScript). A pnpm workspace: one app per system from the
platform roadmap, over shared design-system and data packages.

## Layout

```
apps/web      Public marketing site          :3000
apps/ops           Operations Admin Portal (maintenance)  :3001
apps/tenant        Tenant Services Portal                 :3002
apps/housekeeping  Housekeeping Admin Portal              :3003
apps/field         Technician Field App                   :3004
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

All reads and writes go through `packages/core/src` — `operations.js` for
service requests, staff, and dashboard rollups; `properties.js` for
listings; `site.js` for site-wide strings. They currently read JSON from
`packages/core/data`; keep that the single seam so the source can change
without touching pages.

The entities there (Property, Unit, Tenant, Lease, Service Request, Staff) are
the shared model the platform roadmap mandates. Extend them in `core` rather
than redefining them in an app.

Derived state — unit lifetime spend, a technician's load, the repeat-fault
flag, the period rollups — is computed in `core` at read time, never stored
and never recomputed in a page. That is why every ops route is
`dynamic = "force-dynamic"`.

Nothing in the UI reports elapsed time or SLA state: no request age, no
"waiting Nh", no on-track / at-risk / overdue. Requests carry the absolute
timestamps in `stageHistory` and nothing else about time, and pressure is read
off what is unassigned rather than off a clock. The field boards are the worst
offenders — `2h 41m late`, `1h 48m on site`, and per-row durations like
`30 min · by 12:00` — and none of it is rendered; a job has no duration and
only an ops-booked one has a slot. Do not reintroduce a duration
without the SLA targets being real and admin-configurable first.

`getSignedInTenant()` is a stub standing in for a session. There is no auth
anywhere yet. The tenant portal's `/login` screens are the designed flow
rendered as navigation only: they authenticate nobody, and every submit
control on a form is disabled with the reason stated on screen. Wire them to a
real session rather than making them look like they work.

The ops, housekeeping and field apps write. `operations.js` exposes
`createRequest`, `assignRequests`, `setPriority`, `deleteRequests`,
`addHousekeepingRate`, `removeHousekeepingRate`, `addStaff`, `updateStaff` and
`removeStaff`, and the field app adds `startRequest`, `completeRequest` and
`handBackRequest` — over `store.js`, one mutable copy of the seed JSON, held
on `globalThis` for the life of the server process. Each app is its own
process, so each holds its own copy: a booking made in the housekeeping portal
does not appear in the tenant portal or ops, a job assigned in ops does not
reach the technician's worklist, and a hand-back does not reach either admin
portal — not until the data has a real home. Removals are guarded rather than soft: a rate with
open bookings and a technician holding open work both refuse, with the reason
carried back to the dialog.

Photos on a request are inlined as data URLs by `createRequestAction` and kept
with the request. There is no file store, which is what the count and size
caps there are standing in for — give them somewhere real to live before
raising either. `operations.json` stays the seed and is never
written to, so a restart (or the sidebar's "Reset demo data") is the way back
to a known state. Pages call these through the server actions in
`apps/<app>/src/app/actions.js`, which are the only place `revalidatePath` is
allowed to live.

Each admin portal manages one trade. `apps/ops` is maintenance only;
`apps/housekeeping` is housekeeping only — its services come priced from the
rate card, a booking keeps the price it was made at, it is billed to the
tenant, and it has no emergency tier and no repeat-fault flag. The shared
reads in `operations.js` take a `type` option (defaulting to maintenance)
rather than either app filtering after the fact.

`apps/field` is the technician's side of the same data: one person's own open
work rather than a portfolio of it, phone-first, with no queue, filters, or
dashboard. It serves whichever trade the signed-in technician's `role` is, so
it is not a fourth portal over a fifth slice — `getWorklist` and `getJob` are
the only reads it has, and `getJob` refuses work the technician does not hold.
The worklist's order is derived, never scheduled: started work first, then an
emergency, then oldest. `getSignedInTechnician()` is a stub standing in for a
session exactly as `getSignedInTenant()` is, which is also why the server
actions ask who is signed in rather than letting a form post an identity.

Closing a job takes `requiredCompletionPhotos` photos and cannot set a price:
a housekeeping booking has carried its charge since `createRequest` read it
off the rate card, and maintenance is never billed on, so the total is stated
to the technician rather than collected from them. The photos are kept in
`completionPhotos`, apart from the tenant's `photos` of the fault.

"Can't do it" is `handBackRequest`, and it is deliberately not a new stage:
the job goes back to unassigned `submitted`, which is where the ops queue
already reads its pressure from, carrying `handBack` with the reason and who
gave it. The assigned entry leaves `stageHistory` with the assignee, since a
request must not read as having reached a stage it is now behind. Both admin
portals surface that reason on the request detail and in the activity log —
do not add a stage for this.

Controls that still cannot work say so on the screen rather than being hidden:
notifying a tenant, sending to an external vendor, publishing a rate version,
and issuing a field-app invite all need a path that does not exist yet. Keep
that rule — a disabled control with its reason beats one that pretends.

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
