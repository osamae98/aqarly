import { api, apiOrNull, segment } from "./api";
import type { Listing } from "./types";

// Single seam between the UI and wherever properties actually come from.
// Listings are served by aqarly-api (`/listings`); the pages calling these
// didn't change when the JSON file behind them did. `data/properties.json`
// is now the API's seed, not something read here.

export interface ListingFilters {
  purpose?: string;
  type?: string;
  featured?: boolean;
}

export async function getProperties({
  purpose,
  type,
  featured,
}: ListingFilters = {}): Promise<Listing[]> {
  const query = new URLSearchParams();
  if (purpose) query.set("purpose", purpose);
  if (type) query.set("type", type);
  if (featured !== undefined) query.set("featured", String(featured));

  return api<Listing[]>(query.size ? `/listings?${query}` : "/listings");
}

export async function getPropertyBySlug(slug: string): Promise<Listing | null> {
  return apiOrNull<Listing>(`/listings/${segment(slug)}`);
}

export async function getPropertySlugs(): Promise<string[]> {
  return (await getProperties()).map((p) => p.slug);
}

export function formatPrice(price: number, currency = "AED"): string {
  return new Intl.NumberFormat("en", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(price);
}
