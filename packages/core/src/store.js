import seed from "../data/operations.json";

// The write path for the prototype. `operations.json` is the seed, never the
// record: this module hands out one mutable copy of it that lives for as long
// as the server process does, so the portal can be clicked through end to end
// without a database and without the committed seed data drifting.
//
// It stays behind `operations.js` for the same reason the reads do — swap the
// bodies there for API or database calls and no page has to change.
//
// Pinned on `globalThis` so a dev-server module reload does not silently hand
// half the app a second, empty copy.
const KEY = Symbol.for("aqarly.operations.store");

function fresh() {
  return structuredClone(seed);
}

if (!globalThis[KEY]) globalThis[KEY] = fresh();

// Collections are mutated in place, so every module that imported `db` keeps
// looking at the same arrays.
export const db = globalThis[KEY];

export function resetStore() {
  const clean = fresh();
  for (const key of Object.keys(clean)) {
    db[key].length = 0;
    db[key].push(...clean[key]);
  }
}

// Ids follow the seed's own shape so a record created here is indistinguishable
// from one that shipped with it.
export function nextId(collection, prefix) {
  const highest = db[collection].reduce((max, item) => {
    const digits = Number(String(item.id).replace(/\D/g, ""));
    return Number.isFinite(digits) && digits > max ? digits : max;
  }, 0);

  return `${prefix}-${highest + 1}`;
}
