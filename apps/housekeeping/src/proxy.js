import { NextResponse } from "next/server";

// Runs before every page. Without a session cookie there's nobody to show the
// portal to, so go to /login before any page starts asking the API for data:
// the portal layout's own check (getSignedInAdmin) runs alongside the page's
// reads, not before them, and those reads would fail first. A cookie that's
// present but expired is still caught by that layout check.
export function proxy(request) {
  if (request.cookies.has("aqarly_session_housekeeping")) return NextResponse.next();
  return NextResponse.redirect(new URL("/login", request.url));
}

export const config = {
  // Everything but the sign-in screens and Next's own files.
  matcher: ["/((?!login|_next/|icon.svg|favicon.ico).*)"],
};
