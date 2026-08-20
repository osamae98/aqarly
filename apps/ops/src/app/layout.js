import Link from "next/link";
import Container from "@aqarly/ui/Container";
import { fontVariables } from "@aqarly/ui/fonts";
import "./globals.css";

// SLA state and request age are computed against "now", so nothing in this app
// may be captured at build time.
export const dynamic = "force-dynamic";

export const metadata = {
  title: {
    default: "Operations",
    template: "%s — Operations",
  },
  description: "Maintenance and housekeeping across the portfolio.",
};

const opsNav = [
  { href: "/", label: "Dashboard" },
  { href: "/requests", label: "Queue" },
];

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${fontVariables} h-full antialiased`}>
      <body className="flex min-h-full flex-col bg-page font-sans">
        <header className="border-b border-border bg-surface">
          <Container>
            <nav className="flex items-center gap-1 py-3">
              <span className="mr-3 text-sm font-semibold text-ink">
                Operations
              </span>
              {opsNav.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="rounded-pill px-3 py-1.5 text-sm text-ink-soft transition-colors hover:bg-sunken hover:text-ink"
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          </Container>
        </header>
        <main className="flex-1">
          <Container className="py-8">{children}</Container>
        </main>
      </body>
    </html>
  );
}
