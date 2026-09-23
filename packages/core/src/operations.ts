import { api, apiOrNull, queryString, segment, type ApiSchemas } from "./api";
import type {
  Category,
  HousekeepingRate,
  MaintenanceCategory,
  Origin,
  PhotoInput,
  Priority,
  Property,
  RequestType,
  ServiceRequest,
  Stage,
  Staff,
  Tier,
  Tone,
} from "./types";

export type * from "./types";

// Single seam between the portals and wherever operations data lives, which
// is now aqarly-api: every read and write below is a call to it. What stays
// here is what the API deliberately doesn't send — labels, tones, formatting,
// notification wording — and the few shapes built from one list for display.
// No page changed when the source did.

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

const HOUR = 1000 * 60 * 60;

function time(iso: string): number {
  return new Date(iso).getTime();
}

function stageAt(request: Pick<ServiceRequest, "stageHistory">, stage: Stage): string | null {
  return request.stageHistory.find((entry) => entry.stage === stage)?.at ?? null;
}

function hoursBetween(from: string, to: number): number {
  return (to - time(from)) / HOUR;
}

// Fills `categoryLabels` / `categoryCodes` in from the rate card, so a service
// added in another app (or since retired) reads by its name here too.
async function refreshServiceLabels(): Promise<void> {
  const rates = await api<HousekeepingRate[]>("/housekeeping-rates?includeRetired=true");
  learnServiceLabels(rates);
}

// Only fills in what the lookups don't have: the short names above are what
// the queues have always shown ("Laundry"), even where the rate card words it
// longer ("Laundry & linens").
function learnServiceLabels(rates: HousekeepingRate[]): void {
  for (const rate of rates) {
    categoryLabels[rate.serviceType] ??= rate.label;
    categoryCodes[rate.serviceType] ??= rate.label.slice(0, 2).toUpperCase();
  }
}

// A request with what it points at. The API sends the records; `tier` is
// display logic and added here.
export type EnrichedRequest = ApiSchemas["EnrichedRequestOut"] & { tier: Tier };

function enrich(request: ApiSchemas["EnrichedRequestOut"]): EnrichedRequest {
  return { ...request, tier: tierFor(request) };
}

export type RequestSort = "age" | "newest";

// Every filter is optional and they narrow together. `assigneeId` also takes
// "unassigned".
export interface RequestFilters {
  stage?: Stage;
  type?: RequestType;
  category?: Category;
  priority?: Priority;
  tier?: Tier;
  propertyId?: string;
  unitId?: string;
  assigneeId?: string;
  tenantId?: string;
  open?: boolean;
  search?: string;
  sort?: RequestSort;
}

// Filters arrive straight from URL search params, so a value the API wouldn't
// know is possible. It matches nothing, as it always has — except `sort`,
// which falls back to oldest first.
function knownFilters(filters: RequestFilters): Record<string, string | boolean | undefined> | null {
  const { stage, type, priority, tier, sort, open, ...rest } = filters;
  if (stage && !stages.includes(stage)) return null;
  if (type && !(type in typeLabels)) return null;
  if (priority && priority !== "urgent" && priority !== "normal") return null;
  if (tier && !(tier in tierLabels)) return null;
  return {
    ...rest,
    stage,
    type,
    priority,
    tier,
    open: open ? true : undefined,
    sort: sort === "newest" ? "newest" : undefined,
  };
}

export async function getRequests(filters: RequestFilters = {}): Promise<EnrichedRequest[]> {
  const params = knownFilters(filters);
  if (!params) return [];

  const [requests] = await Promise.all([
    api<ApiSchemas["EnrichedRequestOut"][]>(`/requests${queryString(params)}`),
    refreshServiceLabels(),
  ]);
  return requests.map(enrich);
}

export async function getRequestById(id: string): Promise<EnrichedRequest | null> {
  const [request] = await Promise.all([
    apiOrNull<ApiSchemas["EnrichedRequestOut"]>(`/requests/${segment(id)}`),
    refreshServiceLabels(),
  ]);
  return request && enrich(request);
}

// Previous / next within the queue's own order, so paging through the detail
// screen walks the same list the admin was just looking at.
export interface RequestNeighbours {
  previous: EnrichedRequest | null;
  next: EnrichedRequest | null;
  position?: number;
  total?: number;
}

export async function getRequestNeighbours(
  id: string,
  filters: RequestFilters = {},
): Promise<RequestNeighbours> {
  const list = await getRequests(filters);
  const index = list.findIndex((request) => request.id === id);

  if (index === -1) return { previous: null, next: null };

  return {
    previous: list[index - 1] ?? null,
    next: list[index + 1] ?? null,
    position: index + 1,
    total: list.length,
  };
}

// --- Portfolio reads -----------------------------------------------------
// The queue answers "what needs doing now"; these answer "what is this unit,
// this building, this technician like" — the context Ops PRD §7 wants an
// admin to have before assigning work. The API derives every number.

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

export type RepeatFault = ApiSchemas["RepeatFaultOut"];

// Each portal manages one trade, so a unit's counts and history read off
// that trade's work alone.
export type UnitRecord = ApiSchemas["UnitRecordOut"];

export async function getUnits({
  propertyId,
  type,
}: { propertyId?: string; type?: RequestType } = {}): Promise<UnitRecord[]> {
  const [units] = await Promise.all([
    api<UnitRecord[]>(`/units${queryString({ propertyId, type })}`),
    refreshServiceLabels(),
  ]);
  return units;
}

export async function getUnitById(
  id: string,
  { type }: { type?: RequestType } = {},
): Promise<UnitRecord | null> {
  const [unit] = await Promise.all([
    apiOrNull<UnitRecord>(`/units/${segment(id)}${queryString({ type })}`),
    refreshServiceLabels(),
  ]);
  return unit;
}

// The dashboard reports over a window; the queue and the sidebar do not.
// Anything counted as "raised" or "spent" is period-scoped, while open work
// is open regardless of when it came in.
export type ReportPeriod = "month" | "quarter" | "year";

export const reportPeriods: Record<ReportPeriod, { label: string; days: number }> = {
  month: { label: "This month", days: 30 },
  quarter: { label: "Quarter", days: 90 },
  year: { label: "Year", days: 365 },
};

// Anything that is not a known period reports over all time.
function knownPeriod(period: string | undefined): ReportPeriod | undefined {
  return period && period in reportPeriods ? (period as ReportPeriod) : undefined;
}

export interface RollupOptions {
  period?: string;
  type?: RequestType;
}

// Per-building rollup — the "cost and volume by building" the ops manager
// view reports on, and the scope list the sidebar narrows the queue by.
export async function getPropertyRollups({ period, type }: RollupOptions = {}) {
  return api<ApiSchemas["PropertyRollupOut"][]>(
    `/reports/properties${queryString({ period: knownPeriod(period), type })}`,
  );
}

// Spend and volume by category, for the two bar blocks on the dashboard.
// One trade at a time, since each portal reports on its own.
type ApiCategoryRollup = ApiSchemas["CategoryRollupOut"];

export interface CategoryRollup extends ApiCategoryRollup {
  label: string;
}

export async function getCategoryRollups({
  period,
  type,
}: RollupOptions = {}): Promise<CategoryRollup[]> {
  const [rollups] = await Promise.all([
    api<ApiSchemas["CategoryRollupOut"][]>(
      `/reports/categories${queryString({ period: knownPeriod(period), type })}`,
    ),
    refreshServiceLabels(),
  ]);
  return rollups.map((rollup) => ({
    ...rollup,
    label: categoryLabels[rollup.category] ?? rollup.category,
  }));
}

// The roster is deliberately thin: Ops PRD §9 makes the HRMS the system of
// record for staff identity in Phase 3, so everything here is either derived
// from request data or ops-owned (load, coverage). One trade at a time: ops
// manages the maintenance crew, the housekeeping portal its own. Retired
// staff are not on it.
export type RosterMember = ApiSchemas["RosterMemberOut"];

export async function getStaffRoster({ type }: { type?: RequestType } = {}): Promise<RosterMember[]> {
  return api<RosterMember[]>(`/staff/roster${queryString({ type })}`);
}

// Ranked candidates for the assign panel: role has to match the request
// type, then whoever is already working that building, then whoever has the
// most room left in their day. Capacity outweighs familiarity.
export async function getAssignmentCandidates(request: Pick<ServiceRequest, "id">) {
  return api<ApiSchemas["CandidateOut"][]>(`/requests/${segment(request.id)}/candidates`);
}

// One trade at a time. The money splits the way the business does:
// maintenance spend is the landlord's, housekeeping is billed on to tenants,
// so the two never land on the same dashboard.
export async function getDashboardStats({ period, type }: RollupOptions = {}) {
  return api<ApiSchemas["DashboardOut"]>(
    `/reports/dashboard${queryString({ period: knownPeriod(period), type })}`,
  );
}

// Maps a request's stage history onto the shape `@aqarly/ui/Timeline` renders.
export interface StageStep {
  label: string;
  caption: string;
  state: "done" | "current" | "todo";
}

export function stageSteps(
  request: Pick<ServiceRequest, "stage" | "stageHistory">,
): StageStep[] {
  const reached = new Map(
    request.stageHistory.map((entry): [Stage, string] => [entry.stage, entry.at]),
  );
  const currentIndex = stages.indexOf(request.stage);

  return stages.map((stage, index) => ({
    label: stageLabels[stage],
    caption: reached.has(stage) ? formatDateTime(reached.get(stage)!) : "—",
    state:
      index < currentIndex ? "done" : index === currentIndex ? "current" : "todo",
  }));
}

export type TenantAccount = ApiSchemas["TenantAccountOut"];

export async function getTenantById(id: string): Promise<TenantAccount | null> {
  return apiOrNull<TenantAccount>(`/tenants/${segment(id)}`);
}

// STUB: stands in for the signed-in session until auth exists. The Tenant
// Portal PRD specifies phone + OTP against accounts provisioned at lease
// signing; nothing here authenticates anyone. Replace this, not its callers.
export async function getSignedInTenant() {
  return getTenantById("ten-alhabsi");
}

// --- Tenant portal reads -------------------------------------------------
// The tenant sees a much narrower slice than ops: their own requests, the
// notifications those requests generated, and what they were charged. The
// requests come from the API; the notifications and the monthly history are
// wording and grouping over them, so they're built here.

export interface TenantNotification {
  id: string;
  requestId: string;
  stage: Stage;
  type: RequestType;
  at: string;
  title: string;
  body: string;
  unread: boolean;
}

function notificationsFor(
  request: EnrichedRequest,
): Omit<TenantNotification, "unread">[] {
  const { assignee, summary, type, charge, completionNotes } = request;
  const who = assignee?.name;

  const copy: Record<Stage, { title: string; body: string }> = {
    submitted: {
      title: "Request submitted",
      body: `${summary} — we'll let you know as soon as it is assigned.`,
    },
    assigned: {
      title: `Request assigned: ${summary}`,
      body: who
        ? `${who} has been assigned and will be in touch.`
        : "A team member has been assigned.",
    },
    "in-progress": {
      title: `Work started: ${summary}`,
      body: who ? `${who} is working on it now.` : "Work is under way.",
    },
    done: {
      title:
        type === "housekeeping"
          ? `Housekeeping completed${charge ? " & charged" : ""}`
          : "Maintenance completed",
      body: charge
        ? `${summary} — ${formatCharge(charge)} charged to your account.`
        : `${summary} — ${completionNotes ?? "marked complete."}`,
    },
  };

  return request.stageHistory.map((entry) => ({
    id: `${request.id}-${entry.stage}`,
    requestId: request.id,
    stage: entry.stage,
    type,
    at: entry.at,
    ...copy[entry.stage],
  }));
}

// Notifications are derived from stage history rather than stored: every
// stage change is exactly the event the tenant would have been pinged about.
// Read state needs a write path, so "unread" stands in as "in the last day".
export async function getTenantNotifications(
  tenantId: string,
  { now = Date.now() }: { now?: number } = {},
): Promise<TenantNotification[]> {
  const requests = await getRequests({ tenantId });

  return requests
    .flatMap(notificationsFor)
    .map((notification) => ({
      ...notification,
      unread: hoursBetween(notification.at, now) < 24,
    }))
    // Newest first; a request raised already assigned has both at one
    // instant, and the later stage is the newer news.
    .sort((a, b) => time(b.at) - time(a.at) || stages.indexOf(b.stage) - stages.indexOf(a.stage));
}

function monthLabel(month: string): string {
  return new Intl.DateTimeFormat("en", {
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(`${month}-01T00:00:00Z`));
}

// Completed work for one tenant, bucketed by the month it was completed in,
// with the housekeeping charges for that month already totalled.
export interface CompletedRequest extends EnrichedRequest {
  completedAt: string;
}

export interface HistoryMonth {
  month: string;
  label: string;
  items: CompletedRequest[];
  housekeepingTotal: number;
}

export async function getTenantHistory(
  tenantId: string,
  { type }: { type?: RequestType } = {},
): Promise<HistoryMonth[]> {
  const requests = await getRequests({ tenantId, type, stage: "done" });
  const buckets = new Map<string, HistoryMonth>();

  for (const request of requests) {
    const doneAt = stageAt(request, "done");
    if (!doneAt) continue;
    const month = doneAt.slice(0, 7);

    if (!buckets.has(month)) {
      buckets.set(month, {
        month,
        label: monthLabel(month),
        items: [],
        housekeepingTotal: 0,
      });
    }

    const bucket = buckets.get(month)!;
    bucket.items.push({ ...request, completedAt: doneAt });
    if (request.type === "housekeeping") bucket.housekeepingTotal += request.charge ?? 0;
  }

  return [...buckets.values()]
    .sort((a, b) => b.month.localeCompare(a.month))
    .map((bucket) => ({
      ...bucket,
      items: bucket.items.sort((a, b) => time(b.completedAt) - time(a.completedAt)),
    }));
}

// The buildings operations manages, by name. (Marketing listings are
// `getProperties` in `./properties`.)
export async function getProperties(): Promise<Property[]> {
  return api<Property[]>("/properties");
}

// The card as it's listed, without retired services.
export async function getHousekeepingRates(): Promise<HousekeepingRate[]> {
  const [rates] = await Promise.all([
    api<HousekeepingRate[]>("/housekeeping-rates"),
    refreshServiceLabels(),
  ]);
  return rates;
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

// --- Writes --------------------------------------------------------------
// The portals' forms go through here, to the API. It checks everything and
// refuses in words meant for the admin or tenant; an `ApiError` carries that
// message back to the action unchanged. Callers are server actions; they
// revalidate, this does not.

export interface NewRequest {
  unitId: string;
  category: Category;
  priority?: Priority;
  summary: string;
  description?: string;
  photos?: (PhotoInput | null | undefined)[];
  assigneeId?: string | null;
  scheduledDate?: string | null;
  scheduledSlot?: string | null;
  origin?: Origin;
}

// The category decides the trade, and the trade decides who can be assigned
// and who gets billed. Housekeeping is booked at the rate card's price and
// keeps it, and carries no emergency.
export async function createRequest({
  unitId,
  category,
  priority = "normal",
  summary,
  description = "",
  photos = [],
  assigneeId = null,
  scheduledDate = null,
  scheduledSlot = null,
  origin = "ops",
}: NewRequest): Promise<EnrichedRequest> {
  const body: ApiSchemas["NewRequestIn"] = {
    unitId,
    category,
    priority,
    summary: summary ?? "",
    description: description ?? "",
    photos: photos.filter((photo): photo is PhotoInput => Boolean(photo)),
    assigneeId: assigneeId || null,
    scheduledDate: scheduledDate || null,
    scheduledSlot: scheduledSlot || null,
    origin,
  };
  return enrich(await api<ApiSchemas["EnrichedRequestOut"]>("/requests", { method: "POST", body }));
}

// Assigning is the one action that also moves a request forward: work nobody
// holds is still "submitted", and the moment someone holds it, it is not.
// Closed work is skipped; what was touched comes back.
export async function assignRequests(
  ids: string | string[],
  assigneeId: string,
): Promise<ServiceRequest[]> {
  const body: ApiSchemas["AssignIn"] = { ids: [ids].flat(), assigneeId };
  return api("/requests/assign", { method: "POST", body });
}

// Takes a plain string because the API checks it rather than trusting it.
export async function setPriority(
  ids: string | string[],
  priority: string,
): Promise<ServiceRequest[]> {
  const body: ApiSchemas["PriorityIn"] = { ids: [ids].flat(), priority };
  return api("/requests/priority", { method: "POST", body });
}

// Removing a request takes it out of the queue entirely, with its history and
// photos. Its charges leave the rollups with it.
export async function deleteRequests(ids: string | string[]): Promise<ServiceRequest[]> {
  const body: ApiSchemas["RequestIdsIn"] = { ids: [ids].flat().filter(Boolean) };
  return api("/requests/delete", { method: "POST", body });
}

// --- Housekeeping rates --------------------------------------------------
// The rate card the housekeeping portal manages and tenants book against.

export async function addHousekeepingRate({
  label,
  price,
}: {
  label: string;
  price: number | string;
}): Promise<HousekeepingRate> {
  const body: ApiSchemas["RateIn"] = { label, price };
  const rate = await api<HousekeepingRate>("/housekeeping-rates", { method: "POST", body });
  learnServiceLabels([rate]);
  return rate;
}

// A rate can only leave the card once nothing open is priced against it. It's
// retired rather than deleted, so bookings made against it keep its name.
export async function removeHousekeepingRate(serviceType: string): Promise<HousekeepingRate> {
  return api(`/housekeeping-rates/${segment(serviceType)}`, { method: "DELETE" });
}

// --- Staff ---------------------------------------------------------------
// Ops PRD §9 makes the HRMS the record for staff identity from Phase 3. Until
// then the roster is ops-owned and editable here, which is why only what ops
// actually decides — who they are and how to reach them — can be set.
// Ops manages the maintenance crew; the housekeeping portal manages its own.

// `photo` is a data URL, held with the member the way request photos are —
// there is no file store for either yet. Role arrives as a plain string from a
// form and the API checks it.
export interface StaffInput {
  name: string;
  phone: string;
  role: string;
  photo?: string | null;
}

export async function addStaff({ name, phone, role, photo = null }: StaffInput): Promise<Staff> {
  const body: ApiSchemas["StaffIn"] = { name, phone, role, photo };
  return api("/staff", { method: "POST", body });
}

// Leaving `photo` out keeps the one they have.
export async function updateStaff(id: string, { name, phone, role, photo }: StaffInput): Promise<Staff> {
  const body: ApiSchemas["StaffIn"] = { name, phone, role, photo: photo || null };
  return api(`/staff/${segment(id)}`, { method: "PUT", body });
}

// Work that is still open has to be somewhere, so a technician holding any
// cannot leave the roster. Once they can, they're retired rather than deleted:
// the work they closed still says who did it.
export async function removeStaff(id: string): Promise<Staff> {
  return api(`/staff/${segment(id)}`, { method: "DELETE" });
}

// --- Field app -----------------------------------------------------------
// The technician's app reads the same data from the other end: one person's
// own work rather than a portfolio of it. It is deliberately narrow — no
// queue, no filters, no dashboard — so everything here answers only "what
// should I be doing, and what happens when I do it".

// STUB: stands in for the signed-in technician until auth exists, exactly as
// `getSignedInTenant` does for a tenant. Nothing here authenticates anyone.
// Replace this, not its callers.
export async function getSignedInTechnician(): Promise<Staff | null> {
  return apiOrNull<Staff>("/staff/stf-haddad");
}

// The field app reads and writes through aqarly-api, so every technician's
// view is the one database rather than this process's copy. Its order, counts
// and repeat-fault flag are derived there: started work first, then an
// emergency, then oldest; closed work most recently closed first. The one
// thing added here is `tier`, which is display logic (`tierFor`).
//
// Ops reads and writes the same API, so a job assigned in ops reaches the
// technician's worklist and a hand-back reaches the ops queue.

type ApiJob = ApiSchemas["JobOut"];

// Everything the worklist screen puts on the glass, already split the way it
// is drawn: one job led with, the rest queued behind it, and what is closed.
export interface Job extends ApiJob {
  tier: Tier;
}

export interface Worklist {
  technician: Staff;
  next: Job | null;
  queued: Job[];
  closed: Job[];
  counts: { left: number; urgent: number; closed: number };
}

function asJob(job: ApiJob): Job {
  return { ...job, tier: tierFor(job) };
}

function jobPath(id: string, technicianId: string, action = ""): string {
  return `/technicians/${segment(technicianId)}/jobs/${segment(id)}${action}`;
}

export async function getWorklist(technicianId: string): Promise<Worklist | null> {
  const worklist = await apiOrNull<ApiSchemas["WorklistOut"]>(
    `/technicians/${segment(technicianId)}/worklist`,
  );
  if (!worklist) return null;

  return {
    ...worklist,
    next: worklist.next && asJob(worklist.next),
    queued: worklist.queued.map(asJob),
    closed: worklist.closed.map(asJob),
  };
}

// One job, and only if it is this technician's: the API refuses (403) work
// they don't hold, so a job reassigned out from under someone stops resolving
// for them.
export async function getJob(id: string, technicianId: string): Promise<Job | null> {
  const job = await apiOrNull<ApiJob>(jobPath(id, technicianId), [403, 404]);
  return job && asJob(job);
}

// --- Field app writes ----------------------------------------------------
// The API checks the holder itself and refuses with a message meant for the
// technician; an `ApiError` carries it back to the action unchanged.

// Arriving on site. Idempotent: tapping start on a job already under way is
// the technician confirming where they are, not a second event.
export async function startRequest(id: string, technicianId: string): Promise<Job> {
  return asJob(await api<ApiJob>(jobPath(id, technicianId, "/start"), { method: "POST" }));
}

// How many photos close a job, and how many of those are compulsory. The API
// enforces both; they're here so the finish screen can say so up front.
export const maxCompletionPhotos = 10;
export const requiredCompletionPhotos = 2;

// `charge` can't be set: a housekeeping booking has carried its price since
// it was booked, and maintenance is never billed on.
export async function completeRequest(
  id: string,
  technicianId: string,
  {
    notes = "",
    photos = [],
  }: { notes?: string; photos?: (PhotoInput | null | undefined)[] } = {},
): Promise<Job> {
  const body: ApiSchemas["CompleteJobIn"] = {
    notes,
    photos: photos.filter((photo): photo is PhotoInput => Boolean(photo)),
  };
  return asJob(
    await api<ApiJob>(jobPath(id, technicianId, "/complete"), { method: "POST", body }),
  );
}

// "Can't do it": neither a refusal nor a new stage. The job goes back to
// unassigned "submitted" carrying why, and leaves the technician's hands,
// so what comes back is the request rather than a job.
export async function handBackRequest(
  id: string,
  technicianId: string,
  { reason }: { reason?: string | null } = {},
): Promise<ApiSchemas["ServiceRequestOut"]> {
  const body: ApiSchemas["HandBackIn"] = { reason: reason ?? null };
  return api(jobPath(id, technicianId, "/hand-back"), { method: "POST", body });
}
