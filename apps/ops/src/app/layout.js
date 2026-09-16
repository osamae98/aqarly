import CompactNav from "@/components/CompactNav";
import OpsNav from "@/components/OpsNav";
import { fontVariables } from "@aqarly/ui/fonts";
import { getRequests } from "@aqarly/core/operations";
import "./globals.css";

// Every rollup here is derived from request data at read time, so nothing in
// this app may be captured at build time.
export const dynamic = "force-dynamic";

export const metadata = {
  title: {
    default: "Operations",
    template: "%s — Operations",
  },
  description: "Maintenance requests across the portfolio.",
};

export default async function RootLayout({ children }) {
  // The rail carries a live count, so the shell reads it rather than the
  // pages passing it up.
  const open = await getRequests({ open: true, type: "maintenance" });

  return (
    <html lang="en" className={`${fontVariables} h-full antialiased`}>
      <body className="h-full bg-page font-sans text-ink">
        <div className="flex h-full overflow-hidden">
          <OpsNav className="hidden md:flex" openCount={open.length} />

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
