import { IBM_Plex_Mono, IBM_Plex_Sans_Arabic, Inter } from "next/font/google";

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

// The mockups set every figure — refs, counts, money, loads — in IBM Plex
// Mono. It is not in the token set, but it is the family the screens are
// drawn with, so it backs `--font-mono`.
const plexMono = IBM_Plex_Mono({
  variable: "--font-plex-mono",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const fontVariables = `${inter.variable} ${plexArabic.variable} ${plexMono.variable}`;
