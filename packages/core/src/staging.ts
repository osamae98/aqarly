import { timingSafeEqual } from "node:crypto";

// The staging lock. Nothing signs anyone in yet (aqarly-api roadmap Phase 9),
// so a deployed copy is closed behind one shared username and password: the
// browser's own login prompt for people, and the same credentials on every
// server-side call to the API (see `./api`), which is locked the same way.
//
// Off unless STAGING_PASSWORD is set, so local development never asks. It
// keeps strangers out of staging; it is not user accounts.

function credentials(): { user: string; password: string } | null {
  const password = process.env.STAGING_PASSWORD;
  if (!password) return null;
  return { user: process.env.STAGING_USER || "staging", password };
}

// `Authorization` for a call to the API, or undefined when unlocked.
export function stagingAuthorization(): string | undefined {
  const found = credentials();
  if (!found) return undefined;
  return `Basic ${Buffer.from(`${found.user}:${found.password}`).toString("base64")}`;
}

// For each app's `proxy.js`: a 401 that makes the browser ask for the
// password, or undefined to let the request through.
export function stagingLock(request: Request): Response | undefined {
  const expected = stagingAuthorization();
  if (!expected) return undefined;
  if (sameText(request.headers.get("authorization") ?? "", expected)) return undefined;

  return new Response("This is a private staging site.", {
    status: 401,
    headers: { "WWW-Authenticate": 'Basic realm="Aqarly staging", charset="UTF-8"' },
  });
}

// Constant time, so response timing doesn't leak how much of a guess was right.
function sameText(given: string, expected: string): boolean {
  const a = Buffer.from(given);
  const b = Buffer.from(expected);
  return a.length === b.length && timingSafeEqual(a, b);
}
