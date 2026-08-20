# Aqarly

Internal codename for the real estate platform. Front end only for now:
Next.js (App Router) + Tailwind CSS v4, JavaScript.

> `Aqarly` is a working name. The real brand is not referenced anywhere in
> this repo — keep it that way until the launch name is decided, and change it
> in one place (`src/lib/site.js`) when it is.

## Getting started

```bash
pnpm install
pnpm dev
```

This project uses **pnpm**, pinned via the `packageManager` field in
`package.json`. Run it through [corepack](https://nodejs.org/api/corepack.html)
(`corepack enable`) and the right version is used automatically — don't run
`npm install` here, it will produce a competing lockfile.

Then open http://localhost:3000.

## Scripts

| Command         | What it does               |
| --------------- | -------------------------- |
| `pnpm dev`      | Dev server with hot reload |
| `pnpm build`    | Production build           |
| `pnpm start`    | Serve the production build |
| `pnpm lint`     | ESLint                     |

## Structure

```
src/
  app/                     App Router — one folder per route
    layout.js              Root shell: header, main, footer
    page.js                Home
    properties/page.js     Listings index
    properties/[slug]/     Single property detail
    about/page.js
    contact/page.js
    not-found.js           404
    globals.css            Tailwind entry + theme tokens
  components/
    layout/                Header, Footer, Container
    ui/                    Button, Section — generic building blocks
  lib/
    site.js                Site name, nav, contact details
    properties.js          Data access layer (see below)
  data/
    properties.json        Seed data
```

Imports use the `@/` alias, e.g. `import { site } from "@/lib/site"`.

## Data layer

Pages never read `properties.json` directly — they call `src/lib/properties.js`.
That file is the only thing that knows where data comes from, so pointing it at
a real API or database later requires no page changes.

```js
import { getProperties, getPropertyBySlug } from "@/lib/properties";

const featured = await getProperties({ featured: true });
const one = await getPropertyBySlug("sample-listing");
```

## Status

Scaffold only. Every page renders its shell with a `TODO` note describing what
still needs building — listing grid and filters, property gallery and detail,
enquiry form, real content.
