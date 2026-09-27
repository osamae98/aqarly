# Aqarly

Real estate platform front end. Next.js 16 (App Router) + Tailwind CSS v4,
TypeScript (strict). A pnpm workspace: one app per system from the
platform roadmap, over shared design-system and data packages.

## Layout

```
apps/web           Public marketing site                    :3000
apps/ops           Operations Admin Portal (maintenance)     :3001
apps/tenant        Tenant Services Portal                    :3002
apps/housekeeping  Housekeeping Admin Portal                 :3003
apps/field         Technician Field App                      :3004
packages/ui        Design system + tokens
packages/core      Shared data model + read seam
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

All reads and writes go through `packages/core/src` — `operations.ts` for
service requests, staff, and dashboard rollups; `properties.ts` for
listings; `site.ts` for site-wide strings. Keep that the single seam so the
source can change without touching pages.

The source is **aqarly-api**, the backend in the sibling repo
(`../aqarly-api`: FastAPI + Postgres). Every read and write in `operations.ts`
and `properties.ts` is a call to it, so all five apps share one database: a
job assigned in ops reaches the technician's worklist, a hand-back reaches
ops, and a tenant's booking reaches the housekeeping queue. There is no
in-process store any more.

- `core/src/api.ts` is the only place core calls the API. It reads
  `API_URL` (server-only, in each app's gitignored `.env.local`:
  `API_URL=http://localhost:8000`; every app needs it), always
  fetches with `cache: "no-store"`, and turns an API refusal into an
  `ApiError` whose message is the API's `detail`, written to be shown as is.
- A read (GET) that gets 502/503/504 is retried for up to a minute: that's a
  free host's gateway while a sleeping API wakes. Writes are never retried,
  and an API that can't be reached at all fails at once.
- `core/src/api-schema.ts` is generated from the API's `openapi.json`, never
  edited: `pnpm --filter @aqarly/core generate:api` (reads
  `../aqarly-api/openapi.json`, or `API_SCHEMA`). A type the API serves is
  aliased from it (`Listing`, `Job`) rather than declared in `types.ts`.
- The API sends data and the numbers derived from it (spend, load, rollups,
  scores, the repeat-fault flag); core keeps the words. `tier` (`tierFor()`),
  category labels, notification copy, month labels and formatting stay here,
  as do shapes built from one list for display (`getRequestNeighbours`,
  `getTenantNotifications`, `getTenantHistory`).
- `categoryLabels` / `categoryCodes` hold the short names the queues show.
  A service added on the rate card in any app is filled in from
  `/housekeeping-rates?includeRetired=true` by the reads that show categories;
  a name already in the lookup is never overwritten.
- Filters from URL search params are checked in core before the API sees
  them: an unknown `stage`/`type`/`tier`/`priority` matches nothing and an
  unknown `sort` falls back to oldest first, as before.
- Pages reading from the API render per request (`force-dynamic`), so
  `next build` never needs the API running.
- `next.config.mjs` in every app sets `logging.fetches.fullUrl`, so each API
  call shows in that app's dev terminal (the browser never sees it).
- Staging runs on Vercel (free, never sleeps): one project per app, Root
  Directory `apps/<app>`, Production branch `staging`, env `API_URL` and
  `STAGING_PASSWORD`. Each app's `vercel.json` pins its server code to
  Frankfurt (`fra1`), next to the API (Render) and database (Neon). Vercel
  functions accept at most 4.5 MB per request, so a form carrying several
  full-size photos can be refused there until photos move to file storage.
  Setup steps are in the aqarly-api README → "Staging".
- The staging API is locked with a shared password; the staging apps are
  open to anyone with the link (a deliberate choice, so links can be shared).
  With `STAGING_PASSWORD` set, `api.ts` sends it to the API
  (`@aqarly/core/staging`) and each app's `next.config.mjs` adds
  `X-Robots-Tag: noindex`. Unset locally, so nothing changes in development.
  It isn't user accounts; sign-in (below) sits on top of it.
- Its data is reset with `uv run python scripts/seed.py` in aqarly-api, which
  reloads `packages/core/data` (now the API's seed), not by any app's reset.

The entities there (Property, Unit, Tenant, Lease, Service Request, Staff) are
the shared model the platform roadmap mandates. Extend them in `core` rather
than redefining them in an app. Their types live in `packages/core/src/types.ts`
and are re-exported from `@aqarly/core/operations`; the read shapes built on
them (`EnrichedRequest`, `UnitRecord`, `Job`, …) are exported next to the read
that returns them.

Derived state — unit lifetime spend, a technician's load, the repeat-fault
flag, the period rollups — is computed by the API at read time, never stored
and never recomputed in a page or in core. That is why every ops route is
`dynamic = "force-dynamic"`.

Nothing in the UI reports elapsed time or SLA state: no request age, no
"waiting Nh", no on-track / at-risk / overdue. Requests carry the absolute
timestamps in `stageHistory` and nothing else about time, and pressure is read
off what is unassigned rather than off a clock. The field boards are the worst
offenders — `2h 41m late`, `1h 48m on site`, and per-row durations like
`30 min · by 12:00` — and none of it is rendered; a job has no duration and
only an ops-booked one has a slot. Do not reintroduce a duration
without the SLA targets being real and admin-configurable first.

Sign-in is a phone number and a 6-digit code, checked by aqarly-api
(`packages/core/src/auth.ts`). Each app is named in its `next.config.mjs`
(`AQARLY_APP`: tenant, field, ops, housekeeping), which picks the account a
phone opens there and names the app's HttpOnly session cookie, so apps on
different localhost ports don't share sessions. The cookie is set and cleared
only in server actions (`startSignIn`, `verifyCode`, `signOut`); `api.ts`
sends it as `X-Session` on every call.

- Codes aren't texted yet: the API returns the code and the code screen shows
  it as a test code. That goes when a texting provider is wired in.
- **Tenant portal: done.** `/login` → `/login/verify` → first time
  `/login/register` (name, building, unit) → `/login/waiting` until ops
  approves. `getSignedInTenant()` returns the real tenant and redirects anyone
  else where they belong, so pages use it without checking. Sign out works.
- **Field app: done.** `/login` → `/login/verify` → the worklist. No
  registering: only a number on the staff roster gets in, and the API says so
  to anyone else. Sign out is under the worklist. Its server actions check the
  session with `getMe()` rather than `getSignedInTechnician()`, whose redirect
  is a thrown signal their `try/catch` would swallow.
- **Ops and housekeeping: done.** `/login` → `/login/verify` → `/requests`,
  for an admin of that portal's trade only (demo: ops `000 0900`,
  housekeeping `000 0901`). Their pages live in the `app/(portal)/` route
  group, whose layout calls `getSignedInAdmin()` before any data and draws the
  rail, so `/login` renders without either. The rail shows who is signed in
  and Sign out; the compact bar has a sign-out icon. `src/proxy.js` sends
  a visit with no session cookie to /login before anything renders: Next
  renders a layout and its page at the same time, so the layout's check alone
  would let the page's API reads fail first.
- **Country picker.** Every sign-in screen has one (default Saudi Arabia,
  `defaultCountry` in `@aqarly/core/phone`). The login page builds the
  options server-side (`countryOptions()`, from `libphonenumber-js`, which
  stays out of the browser bundle) and the form lays a native select over a
  "+966" box. The action joins country and number with `phoneFrom()`, which
  drops the leading 0 people type at home. "Demo accounts (+000)" is last in
  the list, for the seed's made-up numbers.
- **Ops → Registrations** (`/registrations`): tenants who registered in the
  tenant portal, oldest first, to approve or decline. A unit that already has
  a tenant says so on the card, and the button reads "Approve and replace".
  The rail counts who is waiting.
- **Client components import `@aqarly/core/labels`, never `operations` or
  `auth`.** Those reach `next/headers` (the session cookie), which the
  production build refuses in browser code; `next dev` doesn't complain, so
  run `pnpm --filter <app> build` before pushing to `staging`.
- The field app and tenant portal have a root `loading.js`: while a sleeping
  staging API wakes (core's reads retry for up to two minutes), it's what
  shows instead of a blank screen.

The ops, housekeeping, tenant and field apps write. `operations.ts` exposes
`createRequest`, `assignRequests`, `setPriority`, `deleteRequests`,
`addHousekeepingRate`, `removeHousekeepingRate`, `addStaff`, `updateStaff`,
`removeStaff`, and for the field app `startRequest`, `completeRequest` and
`handBackRequest`; each is one API call, and the API checks everything and
refuses in words the dialog shows as they are. Removals are guarded, then
soft: a rate with open bookings and a technician holding open work both
refuse; once they can go, they're retired (`retiredAt`), not deleted. A
retired rate leaves the card but still names the bookings made against it; a
retired technician leaves the roster and assign panel but still shows as the
assignee of work they closed.

Photos on a request are inlined as data URLs by `createRequestAction` and kept
with the request. There is no file store, which is what the count and size
caps there are standing in for — give them somewhere real to live before
raising either. `packages/core/data` is now only the API's seed, never read
by core: `uv run python scripts/seed.py` in aqarly-api is the way back to a
known state. Every app's "Reset demo data" is disabled with that reason on
screen. Pages call these through the server actions in
`apps/<app>/src/app/actions.js`, which are the only place `revalidatePath` is
allowed to live.

Each admin portal manages one trade. `apps/ops` is maintenance only;
`apps/housekeeping` is housekeeping only — its services come priced from the
rate card, a booking keeps the price it was made at, it is billed to the
tenant, and it has no emergency tier and no repeat-fault flag. The shared
reads in `operations.ts` take a `type` option (defaulting to maintenance)
rather than either app filtering after the fact.

`apps/field` is the technician's side of the same data: one person's own open
work rather than a portfolio of it, phone-first, with no queue, filters, or
dashboard. It serves whichever trade the signed-in technician's `role` is, so
it is not another portal over another slice — `getWorklist` and `getJob` are
the only reads it has, and `getJob` refuses work the technician does not hold.
The worklist's order is derived, never scheduled: started work first, then an
emergency, then oldest. All of that, and every guard on its three writes, is
now enforced by aqarly-api (`/technicians/{id}/worklist`,
`/technicians/{id}/jobs/{jobId}[/start|/complete|/hand-back]`), which only
lets a technician use their own id. `getSignedInTechnician()` returns the technician signed in to the field app,
and sends anyone else to `/login`.

Closing a job takes `requiredCompletionPhotos` photos and cannot set a price:
a housekeeping booking has carried its charge since `createRequest` read it
off the rate card, and maintenance is never billed on, so the total is stated
to the technician rather than collected from them. Those photos are kept in
`completionPhotos`, apart from the tenant's `photos` of the fault.

"Can't do it" is `handBackRequest`, and it is deliberately not a new stage:
the job goes back to unassigned `submitted`, which is where the ops queue
already reads its pressure from, carrying `handBack` with the reason and who
gave it. The assigned entry leaves `stageHistory` with the assignee, since a
request must not read as having reached a stage it is now behind. The ops
portal surfaces that reason on the request detail and in the activity log —
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

## TypeScript

The migration from JavaScript is in progress. `packages/core` is TypeScript;
the apps and `packages/ui` are still `.js`/`.jsx` under `allowJs`, which is not
type-checked (`checkJs` is off), so a JS file compiles against core's types
without being held to them. Convert a file by renaming it to `.ts`/`.tsx` and
typing it — never by adding `// @ts-nocheck` or widening a core type to `any`
to make a caller compile.

Every workspace extends `tsconfig.base.json` (strict). `next build` type-checks
each app along with the core files it imports; `pnpm typecheck` runs `tsc` in
every workspace without building. The model's types come from the API's
OpenAPI schema (`api-schema.ts`); the seed JSON is validated against the model
only by aqarly-api's seed script.

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
