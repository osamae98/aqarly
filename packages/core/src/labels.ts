import type { MaintenanceCategory, RequestType, ServiceRequest, Stage, Tier, Tone, Category } from "./types";

// What the portals show that the API deliberately doesn't send: labels,
// tones, formatting and the limits forms state up front. Nothing here talks
// to the API or reads a cookie, so client components import from here
// (`@aqarly/core/labels`); `operations` re-exports all of it for server code.
// Importing `operations` itself into a client component breaks the
// production build: it reaches `next/headers` through `./auth`.

export const stages: Stage[] = ["submitted", "assigned", "in-progress", "done"];

export const stageLabels: Record<Stage, string> = {
  submitted: "Submitted",
  assigned: "Assigned",
  "in-progress": "In progress",
  done: "Done",
};

// Badge tones come from the design system's stage colour tokens.
export const stageTones: Record<Stage, Tone> = {
  submitted: "neutral",
  assigned: "info",
  "in-progress": "warning",
  done: "success",
};

export const typeLabels: Record<RequestType, string> = {
  maintenance: "Maintenance",
  housekeeping: "Housekeeping",
};

// Housekeeping entries grow and shrink with the rate card, so both lookups are
// open-ended rather than keyed by a fixed union. A service added in the
// housekeeping portal is filled in from the API's rate card (retired services
// included, so old bookings still read as themselves) whenever a read that
// can show categories runs — see `refreshServiceLabels`.
export const categoryLabels: Record<Category, string> = {
  plumbing: "Plumbing",
  electrical: "Electrical",
  ac: "AC",
  appliance: "Appliance",
  other: "Other",
  "standard-clean": "Standard clean",
  "deep-clean": "Deep clean",
  laundry: "Laundry",
  "post-checkout": "Post-checkout",
};

// Two-letter codes for the category tile the request detail leads with.
export const categoryCodes: Record<Category, string> = {
  plumbing: "PL",
  electrical: "EL",
  ac: "AC",
  appliance: "AP",
  other: "GN",
  "standard-clean": "SC",
  "deep-clean": "DC",
  laundry: "LN",
  "post-checkout": "PC",
};

// The categories a tenant can file maintenance under. Housekeeping has no
// equivalent list because its services come priced, from `housekeepingRates`.
export const maintenanceCategories: MaintenanceCategory[] = [
  "ac",
  "plumbing",
  "electrical",
  "appliance",
  "other",
];

export function isMaintenanceCategory(
  category: string,
): category is MaintenanceCategory {
  return (maintenanceCategories as string[]).includes(category);
}

// The ops queue's priority column: an emergency jumps the line, everything
// else is standard.
export const tierLabels: Record<Tier, string> = {
  emergency: "Emergency",
  standard: "Standard",
};

export const tierTones: Record<Tier, Tone> = {
  emergency: "danger",
  standard: "neutral",
};

export function tierFor(request: Pick<ServiceRequest, "priority">): Tier {
  return request.priority === "urgent" ? "emergency" : "standard";
}

// How much work one person can hold before they read as full, and the rule a
// unit is flagged by. The API applies both; they're here so screens can say
// so ("3 visits in 240 days").
export const staffCapacity = 7;
export const repeatFaultRule = { withinDays: 240, occurrences: 3 };

// How many photos one request carries. The API enforces it; the forms say it
// up front.
export const maxRequestPhotos = 4;

// The hour marks a visit's window can start or end on. A request's schedule
// is an absolute, chosen from–to pair typed by the admin, not a derived
// duration, so it carries no SLA meaning on its own.
export const visitHours = [
  "8AM", "9AM", "10AM", "11AM", "12PM",
  "1PM", "2PM", "3PM", "4PM", "5PM", "6PM", "7PM", "8PM",
];

// A slot is "<from>–<to>", both hour marks above, with the visit starting
// before it ends — any span the admin picks, not one of a fixed few.
export function isValidScheduledSlot(slot: string): boolean {
  const [from, to] = slot.split("–");
  const fromIndex = visitHours.indexOf(from);
  const toIndex = visitHours.indexOf(to);
  return fromIndex !== -1 && toIndex !== -1 && fromIndex < toIndex;
}

export function formatCharge(
  amount: number | null | undefined,
  currency = "AED",
): string {
  if (!amount) return "—";
  return new Intl.NumberFormat("en", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(amount);
}

// Day-level formatting for tiles and columns where a timestamp is more
// precision than the reader needs.
export function formatDate(iso: string): string {
  return new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
    timeZone: "UTC",
  }).format(new Date(iso));
}

export function formatDateTime(iso: string): string {
  return new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "UTC",
  }).format(new Date(iso));
}

// How many photos close a job, and how many of those are compulsory. The API
// enforces both; they're here so the finish screen can say so up front.
export const maxCompletionPhotos = 10;
export const requiredCompletionPhotos = 2;
