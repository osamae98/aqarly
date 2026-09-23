import type { components } from "./api-schema";
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

// JSON when there's a body, and the staging credentials when the API is
// locked (see `./staging`).
function headersFor(body: unknown): Record<string, string> {
  const headers: Record<string, string> = {};
  if (body !== undefined) headers["content-type"] = "application/json";
  const authorization = stagingAuthorization();
  if (authorization) headers.authorization = authorization;
  return headers;
}

export async function api<T>(
  path: string,
  { method = "GET", body }: { method?: "GET" | "POST" | "PUT" | "DELETE"; body?: unknown } = {},
): Promise<T> {
  const url = `${baseUrl()}${path}`;
  let response: Response;
  try {
    response = await fetch(url, {
      method,
      headers: headersFor(body),
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
