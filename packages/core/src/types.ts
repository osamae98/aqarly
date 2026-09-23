// The shared model the platform roadmap mandates. Every app reads these
// shapes through `./operations` and `./properties`; extend them here rather
// than redefining them in an app.

import type { components } from "./api-schema";

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

// --- The operations model ---------------------------------------------------
// Served by aqarly-api, so each entity is the API's shape, generated from its
// OpenAPI schema (`./api-schema`) rather than declared here. Where the old
// in-memory shapes left an optional field out, the API sends `null` or `[]`.

type Schemas = components["schemas"];

export type Property = Schemas["PropertyOut"];
export type Unit = Schemas["UnitOut"];
export type Tenant = Schemas["TenantOut"];
// `retiredAt` is set once they've left the roster; closed work keeps them.
export type Staff = Schemas["StaffOut"];
// `retiredAt` is set once the service has left the card.
export type HousekeepingRate = Schemas["RateOut"];
// Photos are inlined as data URLs until there is a file store.
export type Photo = Schemas["PhotoOut"];
export type StageEntry = Schemas["StageEntryOut"];
// `slot` is "<from>–<to>", both from `visitHours`.
export type Schedule = Schemas["ScheduleOut"];
export type HandBack = Schemas["HandBackOut"];
// `stage` and `createdAt` are read from `stageHistory`, the only thing a
// request says about time. `charge` is set when booked off the rate card and
// only counts as spend once the work is done.
export type ServiceRequest = Schemas["ServiceRequestOut"];

// What a form hands a write: anything without bytes is dropped.
export interface PhotoInput {
  name?: string | null;
  dataUrl?: string | null;
}

// --- Listings --------------------------------------------------------------
// Served by aqarly-api, so the shape is the API's: generated from its OpenAPI
// schema rather than declared here.

export type Listing = components["schemas"]["ListingOut"];
