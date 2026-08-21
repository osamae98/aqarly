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
      <body className="min-h-full bg-page font-sans text-ink">
        {/* The portal is designed phone-first; on wider screens it keeps the
         * same shell and only widens where a screen has a desktop layout. */}
        <div className="mx-auto flex min-h-dvh w-full max-w-md flex-col bg-page md:max-w-5xl">
          {children}
        </div>
      </body>
    </html>
  );
}
