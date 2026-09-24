import { cookies } from "next/headers";
import { api, apiOrNull, segment, type ApiSchemas } from "./api";

// Signing in: a phone number and a one-time code, the same in every app.
// aqarly-api does the checking; this keeps the session token in an HttpOnly
// cookie (page JavaScript can't read it) and sends it with every API call
// (see `./api`).
//
// Each app is its own account space: the same phone is a tenant in the tenant
// portal and a technician in the field app. The app is named at build time in
// its next.config.mjs (`AQARLY_APP`), and the cookie is named after it, so on
// localhost, where every port shares cookies, the apps don't overwrite each
// other's sessions.
//
// Cookies can only be set or deleted in a server action; the functions that do
// (`verifyCode`, `signOut`, `startSignIn`) say so.

export type App = ApiSchemas["CodeIn"]["app"];
export type Me = ApiSchemas["MeOut"];

export function currentApp(): App | undefined {
  return (process.env.AQARLY_APP as App | undefined) || undefined;
}

function cookieName(suffix: string): string {
  return `aqarly_${suffix}_${currentApp() ?? "web"}`;
}

const SESSION_DAYS = 30;

function cookieOptions(maxAgeSeconds: number) {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: maxAgeSeconds,
  };
}

// The session token, for `./api`. Undefined outside a request (a build) or
// when nobody is signed in.
export async function sessionToken(): Promise<string | undefined> {
  try {
    return (await cookies()).get(cookieName("session"))?.value;
  } catch {
    return undefined;
  }
}

// Who is signed in to this app, or null. Server components and actions.
export async function getMe(): Promise<Me | null> {
  if (!(await sessionToken())) return null;
  return apiOrNull<Me>("/auth/me", [401]);
}

// --- The sign-in flow --------------------------------------------------------
// The phone typed on the first screen is carried to the code screen in a
// short-lived HttpOnly cookie rather than the URL, along with the code while
// codes are shown on screen instead of texted.

interface PendingSignIn {
  phone: string;
  shownCode: string | null;
}

// Server action only. Asks the API for a code and remembers the phone.
export async function startSignIn(phone: string): Promise<void> {
  const app = currentApp();
  if (!app) throw new Error("This app has no sign-in (AQARLY_APP is not set)");
  const body: ApiSchemas["CodeIn"] = { phone, app };
  const sent = await api<ApiSchemas["CodeOut"]>("/auth/code", { method: "POST", body });
  const pending: PendingSignIn = { phone, shownCode: sent.shownCode ?? null };
  (await cookies()).set(cookieName("signin"), JSON.stringify(pending), cookieOptions(10 * 60));
}

// The sign-in waiting for its code, for the code screen. Null if it's expired
// or never started.
export async function pendingSignIn(): Promise<PendingSignIn | null> {
  try {
    const raw = (await cookies()).get(cookieName("signin"))?.value;
    return raw ? (JSON.parse(raw) as PendingSignIn) : null;
  } catch {
    return null;
  }
}

// Server action only. Proves the code, keeps the session, and says who it is.
export async function verifyCode(code: string): Promise<Me> {
  const pending = await pendingSignIn();
  const app = currentApp();
  if (!pending || !app) throw new Error("That sign-in has expired. Enter your number again.");
  const body: ApiSchemas["VerifyIn"] = { phone: pending.phone, app, code };
  const session = await api<ApiSchemas["SessionOut"]>("/auth/verify", { method: "POST", body });
  const store = await cookies();
  store.set(cookieName("session"), session.token, cookieOptions(SESSION_DAYS * 24 * 60 * 60));
  store.delete(cookieName("signin"));
  return session.me;
}

// Server action only. Ends the session here and in the API.
export async function signOut(): Promise<void> {
  if (await sessionToken()) {
    try {
      await api("/auth/logout", { method: "POST" });
    } catch {
      // Signed out here regardless.
    }
  }
  (await cookies()).delete(cookieName("session"));
}

// --- Tenant registration -----------------------------------------------------

// A signed-in tenant-portal phone with no account says who they are and where
// they live; their building (ops) confirms it.
export async function register(name: string, unitId: string): Promise<Me> {
  const body: ApiSchemas["RegisterIn"] = { name, unitId };
  return api<Me>("/auth/register", { method: "POST", body });
}

export type UnitChoice = ApiSchemas["UnitChoiceOut"];

export async function getUnitChoices(propertyId: string): Promise<UnitChoice[]> {
  return api<UnitChoice[]>(`/properties/${segment(propertyId)}/units`);
}
