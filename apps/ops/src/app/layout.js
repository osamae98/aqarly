import { fontVariables } from "@aqarly/ui/fonts";
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

// Just the document. The portal's shell (rail, sign-in check) is
// `(portal)/layout.js`, so /login renders without either.
export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${fontVariables} h-full antialiased`}>
      <body className="h-full bg-page font-sans text-ink">{children}</body>
    </html>
  );
}
