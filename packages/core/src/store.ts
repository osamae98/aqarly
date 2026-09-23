import seedJson from "../data/operations.json";
import type { OperationsData } from "./types";

// The write path for the prototype. `operations.json` is the seed, never the
// record: this module hands out one mutable copy of it that lives for as long
// as the server process does, so the portal can be clicked through end to end
// without a database and without the committed seed data drifting.
//
// It stays behind `operations.ts` for the same reason the reads do — swap the
// bodies there for API or database calls and no page has to change.
//
// Pinned on `globalThis` so a dev-server module reload does not silently hand
// half the app a second, empty copy.
const KEY: unique symbol = Symbol.for("aqarly.operations.store");

const pinned = globalThis as typeof globalThis & {
  [KEY]?: OperationsData;
};

// JSON imports widen every string, so the seed is asserted to the model once,
// here, rather than at each read.
const seed = seedJson as OperationsData;

function fresh(): OperationsData {
  return structuredClone(seed);
}

// Collections are mutated in place, so every module that imported `db` keeps
// looking at the same arrays.
export const db: OperationsData = (pinned[KEY] ??= fresh());

export function resetStore() {
  const clean = fresh();
  for (const key of Object.keys(clean) as (keyof OperationsData)[]) {
    const collection: unknown[] = db[key];
    collection.length = 0;
    collection.push(...clean[key]);
  }
}

// Ids follow the seed's own shape so a record created here is indistinguishable
// from one that shipped with it.
export function nextId(
  collection: "requests" | "staff",
  prefix: string,
): string {
  const highest = db[collection].reduce((max, item) => {
    const digits = Number(String(item.id).replace(/\D/g, ""));
    return Number.isFinite(digits) && digits > max ? digits : max;
  }, 0);

  return `${prefix}-${highest + 1}`;
}
