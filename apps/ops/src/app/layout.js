import { Suspense } from "react";
import CompactNav from "@/components/CompactNav";
import OpsNav from "@/components/OpsNav";
import { fontVariables } from "@aqarly/ui/fonts";
import { getPropertyRollups, getRequests } from "@aqarly/core/operations";
import "./globals.css";

// Every rollup here is derived from request data at read time, so nothing in
// this app may be captured at build time.
export const dynamic = "force-dynamic";

export const metadata = {
  title: {
    default: "Operations",
    template: "%s — Operations",
  },
  description: "Maintenance and housekeeping across the portfolio.",
};

export default async function RootLayout({ children }) {
  // The rail carries live counts, so the shell reads them rather than the
  // pages passing them up.
  const [open, properties] = await Promise.all([
    getRequests({ open: true }),
    getPropertyRollups(),
  ]);

  return (
    <html lang="en" className={`${fontVariables} h-full antialiased`}>
      <body className="h-full bg-page font-sans text-ink">
        <div className="flex h-full overflow-hidden">
          {/* Reads the active scope off the search params, which need a
           * boundary even under force-dynamic. */}
          <Suspense
            fallback={
              <div className="hidden w-[var(--sidebar-width)] shrink-0 bg-[var(--green-700)] md:block" />
            }
          >
            <OpsNav
              className="hidden md:flex"
              openCount={open.length}
              properties={properties}
            />
          </Suspense>

          <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
            <CompactNav openCount={open.length} />
            <main className="flex min-h-0 flex-1 flex-col overflow-y-auto">
              {children}
            </main>
          </div>
        </div>
      </body>
    </html>
  );
}
