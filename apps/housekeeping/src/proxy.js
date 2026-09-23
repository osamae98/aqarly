import { stagingLock } from "@aqarly/core/staging";

// Runs before every request. On a deployed copy with STAGING_PASSWORD set,
// it asks for the shared staging password; locally it does nothing.
export function proxy(request) {
  return stagingLock(request);
}
