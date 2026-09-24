import type { components } from "./api-schema";
import { sessionToken } from "./auth";
import { stagingAuthorization } from "./staging";

// The one place core talks to aqarly-api. Everything the API returns is typed
// from `./api-schema`, which is generated from the API's openapi.json
// (`pnpm --filter @aqarly/core generate:api`) and never edited by hand.
//
// Server-only: `API_URL` is read on the server, and is deliberately not a
// NEXT_PUBLIC_ variable.

export type ApiSchemas = components["schemas"];

// A refusal from the API. `message` is the API's own `detail`, written to be
// shown to a person as it is.
export class ApiError extends Error {
  readonly status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

function baseUrl(): string {
  const url = process.env.API_URL;
  if (!url) {
    throw new Error(
      "API_URL is not set. Add API_URL=http://localhost:8000 to this app's .env.local",
    );
  }
  return url.replace(/\/$/, "");
}

// JSON when there's a body; who is signed in (the session, see `./auth`);
// and the staging credentials when the API is locked (see `./staging`).
async function headersFor(body: unknown): Promise<Record<string, string>> {
  const headers: Record<string, string> = {};
  if (body !== undefined) headers["content-type"] = "application/json";
  const session = await sessionToken();
  if (session) headers["x-session"] = session;
  const authorization = stagingAuthorization();
  if (authorization) headers.authorization = authorization;
  return headers;
}

// A host on a free plan puts an idle API to sleep, and its gateway answers
// 502/503/504 while the API wakes, which on Render's free plan has taken over
// a minute. A read that gets one of those waits and asks again, for up to two
// minutes, so the first visit after a quiet spell is slow rather than an error
// page. Only reads: a write is
// never sent twice. An API that can't be reached at all (not started, on a
// laptop) still fails at once.
const WAKING_STATUSES = new Set([502, 503, 504]);
const WAKE_UP_WINDOW_MS = 120_000;

function pause(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function api<T>(
  path: string,
  { method = "GET", body }: { method?: "GET" | "POST" | "PUT" | "DELETE"; body?: unknown } = {},
): Promise<T> {
  const url = `${baseUrl()}${path}`;
  const giveUpAt = Date.now() + WAKE_UP_WINDOW_MS;
  let wait = 1_000;
  let response: Response;

  for (;;) {
    try {
      response = await fetch(url, {
        method,
        headers: await headersFor(body),
        body: body === undefined ? undefined : JSON.stringify(body),
        // Never cached. This Next.js caches a `fetch` by default when nothing
        // request-specific has been read yet, and a cached worklist would never
        // show new work: the data changes under every app, not just this one.
        cache: "no-store",
      });
    } catch (error) {
      throw new Error(
        `Can't reach the API at ${url}. Is it running? (\`uv run uvicorn app.main:app\` in aqarly-api)`,
        { cause: error },
      );
    }

    const waking = method === "GET" && WAKING_STATUSES.has(response.status);
    if (!waking || Date.now() + wait > giveUpAt) break;
    await pause(wait);
    wait = Math.min(wait * 2, 8_000);
  }

  if (!response.ok) {
    let detail = `The API answered ${response.status}`;
    try {
      const payload: unknown = await response.json();
      if (payload && typeof payload === "object" && "detail" in payload && typeof payload.detail === "string") {
        detail = payload.detail;
      }
    } catch {
      // Not JSON: keep the status line.
    }
    throw new ApiError(detail, response.status);
  }

  return (await response.json()) as T;
}

// A read where some refusals just mean "there's nothing here for you": the
// null the frontend's reads have always returned for a missing record.
export async function apiOrNull<T>(path: string, nullOn: number[] = [404]): Promise<T | null> {
  try {
    return await api<T>(path);
  } catch (error) {
    if (error instanceof ApiError && nullOn.includes(error.status)) return null;
    throw error;
  }
}

export function segment(value: string): string {
  return encodeURIComponent(value);
}

// `?a=1&b=2` from the defined, non-empty entries, or "" if there are none.
export function queryString(params: Record<string, string | number | boolean | null | undefined>): string {
  const query = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null && value !== "") query.set(key, String(value));
  }
  return query.size ? `?${query}` : "";
}
