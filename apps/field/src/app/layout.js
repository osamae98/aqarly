import { fontVariables } from "@aqarly/ui/fonts";
import "./globals.css";

// A technician's day moves while they are looking at it, and every count on
// the worklist is derived at read time, so nothing here may be captured at
// build time.
export const dynamic = "force-dynamic";

export const metadata = {
  title: {
    default: "Your work",
    template: "%s — Field",
  },
  description: "Today's jobs for one technician.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${fontVariables} h-full antialiased`}>
      <body className="min-h-full bg-page font-sans text-ink">
        {/* One-handed by design: the app is a phone screen and stays one on a
         * desktop rather than growing a second layout nobody in the field
         * will ever see. */}
        <div className="mx-auto flex min-h-dvh w-full max-w-md flex-col bg-page">
          {children}
        </div>
      </body>
    </html>
  );
}
