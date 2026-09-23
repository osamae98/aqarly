// The shared model the platform roadmap mandates. Every app reads these
// shapes through `./operations` and `./properties`; extend them here rather
// than redefining them in an app.

export type Stage = "submitted" | "assigned" | "in-progress" | "done";

// The trade a request belongs to, and the trade a staff member works in.
export type RequestType = "maintenance" | "housekeeping";

export type Priority = "urgent" | "normal";

// The ops queue's reading of `priority`: an emergency jumps the line.
export type Tier = "emergency" | "standard";

export type MaintenanceCategory =
  | "plumbing"
  | "electrical"
  | "ac"
  | "appliance"
  | "other";

// Maintenance categories are fixed; housekeeping ones are whatever
// `serviceType`s the rate card currently lists, so a category is only known
// to be a string.
export type Category = MaintenanceCategory | (string & {});

// Who raised a request. Seeded requests carry none.
export type Origin = "ops" | "tenant";

export type UnitStatus = "occupied" | "under-maintenance" | "vacant";

// The design system's badge tones, as the lookups below pick them.
export type Tone = "neutral" | "info" | "warning" | "success" | "danger";

export interface Property {
  id: string;
  name: string;
  address: string;
}

export interface Unit {
  id: string;
  propertyId: string;
  label: string;
  status: UnitStatus;
  tenantId: string | null;
  bedrooms: number;
  bathrooms: number;
}

export interface Tenant {
  id: string;
  name: string;
  phone: string;
  email: string;
}

export interface Staff {
  id: string;
  name: string;
  phone: string;
  role: RequestType;
  // A data URL; there is no file store yet.
  photo?: string | null;
}

export interface HousekeepingRate {
  serviceType: string;
  label: string;
  price: number;
}

// Photos are inlined with whatever carries them until there is a file store.
export interface Photo {
  name: string;
  dataUrl: string;
}

// What a form hands a write: anything without bytes is dropped.
export interface PhotoInput {
  name?: string | null;
  dataUrl?: string | null;
}

export interface StageEntry {
  stage: Stage;
  // ISO timestamp.
  at: string;
}

export interface Schedule {
  date: string;
  // "<from>–<to>", both from `visitHours`.
  slot: string;
}

export interface HandBack {
  reason: string;
  by: string;
  byName: string | null;
  at: string;
}

export interface ServiceRequest {
  id: string;
  unitId: string;
  tenantId: string | null;
  type: RequestType;
  category: Category;
  priority: Priority;
  summary: string;
  description: string;
  stage: Stage;
  assigneeId: string | null;
  origin?: Origin;
  createdAt: string;
  // One entry per stage reached, and the only thing a request says about time.
  stageHistory: StageEntry[];
  // The fault as the tenant reported it.
  photos?: Photo[];
  // Set when booked off the rate card; only charged once the work is done.
  charge: number | null;
  completionNotes: string | null;
  schedule?: Schedule | null;
  // The work as the technician left it, apart from `photos`.
  completionPhotos?: Photo[];
  handBack?: HandBack;
}

export interface OperationsData {
  properties: Property[];
  units: Unit[];
  tenants: Tenant[];
  staff: Staff[];
  housekeepingRates: HousekeepingRate[];
  requests: ServiceRequest[];
}

// --- Listings --------------------------------------------------------------

export interface Listing {
  slug: string;
  title: string;
  type: string;
  purpose: string;
  price: number;
  currency: string;
  bedrooms: number;
  bathrooms: number;
  areaSqft: number;
  location: { city: string; area: string };
  images: string[];
  description: string;
  featured: boolean;
}
