import Container from "@aqarly/ui/Container";
import { fontVariables } from "@aqarly/ui/fonts";
import "./globals.css";

// Request stages move while a tenant is looking at them.
export const dynamic = "force-dynamic";

export const metadata = {
  title: {
    default: "My home",
    template: "%s — My home",
  },
  description: "Maintenance and housekeeping requests for your unit.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${fontVariables} h-full antialiased`}>
      <body className="flex min-h-full flex-col bg-page font-sans">
        <header className="border-b border-border bg-surface">
          <Container className="max-w-xl">
            <div className="py-4 text-sm font-semibold text-ink">My home</div>
          </Container>
        </header>
        <main className="flex-1">
          <Container className="max-w-xl py-6">{children}</Container>
        </main>
      </body>
    </html>
  );
}
