import { Geist_Mono, IBM_Plex_Sans_Arabic, Inter } from "next/font/google";

// The design system's type tokens name these families, so every app has to
// load the same three. Exported as one className string for the <html> tag.

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const plexArabic = IBM_Plex_Sans_Arabic({
  variable: "--font-plex-arabic",
  subsets: ["arabic"],
  weight: ["400", "500", "600", "700"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const fontVariables = `${inter.variable} ${plexArabic.variable} ${geistMono.variable}`;
