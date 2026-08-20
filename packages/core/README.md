# @aqarly/core

The shared data layer the platform roadmap calls for: one definition of
Property, Unit, Tenant, Lease, Service Request, and Staff, consumed by every
app rather than re-invented per system.

- `src/operations.js` — service requests, SLA state, staff, dashboard rollups.
- `src/properties.js` — listings for the public site.
- `src/site.js` — site-wide strings.

Each module is the single seam between the UI and wherever the data actually
lives. Today they read JSON from `data/`; swap the function bodies for API or
database calls and no app has to change.
