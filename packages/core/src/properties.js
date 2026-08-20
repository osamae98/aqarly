import data from "../data/properties.json";

// Single seam between the UI and wherever properties actually come from.
// Today it reads a local JSON file; swap the bodies for API/DB calls later
// and no page has to change.

export async function getProperties({ purpose, type, featured } = {}) {
  return data.filter((p) => {
    if (purpose && p.purpose !== purpose) return false;
    if (type && p.type !== type) return false;
    if (featured !== undefined && p.featured !== featured) return false;
    return true;
  });
}

export async function getPropertyBySlug(slug) {
  return data.find((p) => p.slug === slug) ?? null;
}

export async function getPropertySlugs() {
  return data.map((p) => p.slug);
}

export function formatPrice(price, currency = "AED") {
  return new Intl.NumberFormat("en", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(price);
}
