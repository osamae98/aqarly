import json from "../data/properties.json";
import type { Listing } from "./types";

const data = json as Listing[];

// Single seam between the UI and wherever properties actually come from.
// Today it reads a local JSON file; swap the bodies for API/DB calls later
// and no page has to change.

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
  return data.filter((p) => {
    if (purpose && p.purpose !== purpose) return false;
    if (type && p.type !== type) return false;
    if (featured !== undefined && p.featured !== featured) return false;
    return true;
  });
}

export async function getPropertyBySlug(slug: string): Promise<Listing | null> {
  return data.find((p) => p.slug === slug) ?? null;
}

export async function getPropertySlugs(): Promise<string[]> {
  return data.map((p) => p.slug);
}

export function formatPrice(price: number, currency = "AED"): string {
  return new Intl.NumberFormat("en", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(price);
}
