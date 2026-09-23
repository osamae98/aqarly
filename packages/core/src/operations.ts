import { db as data, nextId, resetStore } from "./store";
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
  StageEntry,
  Staff,
  Tenant,
  Tier,
  Tone,
  Unit,
} from "./types";

export type * from "./types";

// Single seam between the ops UI and wherever operations data actually lives.
// Today it reads and writes an in-process copy of a local JSON file; swap the
// bodies for API/DB calls later and no page has to change. Mirrors the
// approach in `./properties`.

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
// open-ended rather than keyed by a fixed union.
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

function stageAt(request: ServiceRequest, stage: Stage): string | null {
  return request.stageHistory.find((entry) => entry.stage === stage)?.at ?? null;
}

function hoursBetween(from: string, to: number): number {
  return (to - time(from)) / HOUR;
}

// What a request has actually cost. A housekeeping booking carries its price
// from the moment it is made, but nothing is charged until the work is done,
// so every spend or billed total reads through this rather than `charge`.
function chargedOf(request: ServiceRequest): number {
  return request.stage === "done" ? (request.charge ?? 0) : 0;
}

export interface EnrichedRequest extends ServiceRequest {
  unit: Unit | null;
  property: Property | null;
  tenant: Tenant | null;
  assignee: Staff | null;
  tier: Tier;
}

function enrich(request: ServiceRequest): EnrichedRequest {
  const unit = data.units.find((u) => u.id === request.unitId) ?? null;
  const property = unit
    ? (data.properties.find((p) => p.id === unit.propertyId) ?? null)
    : null;

  return {
    ...request,
    unit,
    property,
    tenant: data.tenants.find((t) => t.id === request.tenantId) ?? null,
    assignee: data.staff.find((s) => s.id === request.assigneeId) ?? null,
    tier: tierFor(request),
  };
}

// The queue leads with the work that came in first; `newest` flips it.
const sorters = {
  age: (a: ServiceRequest, b: ServiceRequest) => time(a.createdAt) - time(b.createdAt),
  newest: (a: ServiceRequest, b: ServiceRequest) => time(b.createdAt) - time(a.createdAt),
};

export type RequestSort = keyof typeof sorters;

// Free-text match across the fields an admin actually types: the ref, the
// unit, the tenant, and the summary.
function matchesSearch(request: EnrichedRequest, term: string): boolean {
  return [
    request.id,
    request.summary,
    request.unit?.label,
    request.property?.name,
    request.tenant?.name,
    request.assignee?.name,
  ]
    .filter((field): field is string => Boolean(field))
    .some((field) => field.toLowerCase().includes(term));
}

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

export async function getRequests({
  stage,
  type,
  category,
  priority,
  tier,
  propertyId,
  unitId,
  assigneeId,
  tenantId,
  open,
  search,
  sort = "age",
}: RequestFilters = {}): Promise<EnrichedRequest[]> {
  const term = search?.trim().toLowerCase();

  return data.requests
    .map(enrich)
    .filter((request) => {
      if (stage && request.stage !== stage) return false;
      if (type && request.type !== type) return false;
      if (category && request.category !== category) return false;
      if (priority && request.priority !== priority) return false;
      if (tier && request.tier !== tier) return false;
      if (propertyId && request.property?.id !== propertyId) return false;
      if (unitId && request.unitId !== unitId) return false;
      // `unassigned` is a stage in practice but reads as an assignee filter.
      if (assigneeId === "unassigned" && request.assigneeId) return false;
      if (assigneeId && assigneeId !== "unassigned" && request.assigneeId !== assigneeId)
        return false;
      if (tenantId && request.tenantId !== tenantId) return false;
      if (open && request.stage === "done") return false;
      if (term && !matchesSearch(request, term)) return false;
      return true;
    })
    .sort(sorters[sort] ?? sorters.age);
}

export async function getRequestById(id: string): Promise<EnrichedRequest | null> {
  const request = data.requests.find((r) => r.id === id);
  return request ? enrich(request) : null;
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

export async function getRequestIds(): Promise<string[]> {
  return data.requests.map((r) => r.id);
}

// Per-unit service history — Ops PRD §7: an admin should see what's happened
// in a unit before assigning new work. Scoped to one trade, since each portal
// manages one: maintenance for ops, housekeeping for the housekeeping portal.
export async function getUnitHistory(
  unitId: string,
  {
    excludeId,
    type = "maintenance",
  }: { excludeId?: string; type?: RequestType } = {},
): Promise<EnrichedRequest[]> {
  return data.requests
    .filter(
      (r) => r.unitId === unitId && r.id !== excludeId && r.type === type,
    )
    .map(enrich)
    .sort(sorters.newest);
}

// --- Portfolio reads -----------------------------------------------------
// The queue answers "what needs doing now"; these answer "what is this unit,
// this building, this technician like" — the context Ops PRD §7 wants an
// admin to have before assigning work.

// Ops PRD §7 wants how much work one person can hold to be admin-configurable
// rather than hardcoded. Fixed for MVP, here as one number to lift into admin
// settings later.
export const staffCapacity = 7;

// A unit that keeps failing the same way is the repair-versus-replace signal,
// so it is flagged on sight rather than left to be read out of the history.
export const repeatFaultRule = { withinDays: 240, occurrences: 3 };

// How many photos one request carries. They are held in memory with the
// request, so the cap is what keeps the store a sensible size rather than a
// business rule.
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

export interface RepeatFault {
  category: Category;
  count: number;
  spend: number;
}

function repeatFaultFor(
  requests: ServiceRequest[],
  now: number,
): RepeatFault | null {
  const cutoff = now - repeatFaultRule.withinDays * 24 * HOUR;
  const counts = new Map<Category, number>();

  for (const request of requests) {
    if (time(request.createdAt) < cutoff) continue;
    counts.set(request.category, (counts.get(request.category) ?? 0) + 1);
  }

  const [worst] = [...counts.entries()].sort(([, a], [, b]) => b - a);
  if (!worst || worst[1] < repeatFaultRule.occurrences) return null;

  const [category, count] = worst;

  return {
    category,
    count,
    spend: requests
      .filter((r) => r.category === category)
      .reduce((sum, r) => sum + chargedOf(r), 0),
  };
}

// Each portal manages one trade, so a unit's counts and history read off
// that trade's work alone.
export interface UnitRecord extends Unit {
  property: Property | null;
  tenant: Tenant | null;
  requestCount: number;
  openCount: number;
  lifetimeSpend: number;
  lastServicedAt: string | null;
  repeatFault: RepeatFault | null;
}

function enrichUnit(
  unit: Unit,
  now: number,
  type: RequestType = "maintenance",
): UnitRecord {
  const requests = data.requests.filter(
    (r) => r.unitId === unit.id && r.type === type,
  );
  const done = requests.filter((r) => r.stage === "done");

  const lastServicedAt = done
    .map((r) => stageAt(r, "done"))
    .filter((at): at is string => at !== null)
    .sort((a, b) => time(b) - time(a))[0] ?? null;

  return {
    ...unit,
    property: data.properties.find((p) => p.id === unit.propertyId) ?? null,
    tenant: unit.tenantId
      ? (data.tenants.find((t) => t.id === unit.tenantId) ?? null)
      : null,
    requestCount: requests.length,
    openCount: requests.filter((r) => r.stage !== "done").length,
    lifetimeSpend: requests.reduce((sum, r) => sum + chargedOf(r), 0),
    lastServicedAt,
    // Housekeeping recurring is the service working, not a fault.
    repeatFault: type === "maintenance" ? repeatFaultFor(requests, now) : null,
  };
}

export async function getUnits({
  propertyId,
  type,
}: { propertyId?: string; type?: RequestType } = {}): Promise<UnitRecord[]> {
  const now = Date.now();

  return data.units
    .filter((unit) => !propertyId || unit.propertyId === propertyId)
    .map((unit) => enrichUnit(unit, now, type))
    .sort(
      (a, b) =>
        b.openCount - a.openCount ||
        (a.property?.name ?? "").localeCompare(b.property?.name ?? "") ||
        a.label.localeCompare(b.label),
    );
}

export async function getUnitById(
  id: string,
  { type }: { type?: RequestType } = {},
): Promise<UnitRecord | null> {
  const unit = data.units.find((u) => u.id === id);
  return unit ? enrichUnit(unit, Date.now(), type) : null;
}

export async function getUnitIds(): Promise<string[]> {
  return data.units.map((u) => u.id);
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
function raisedSince(period: string | undefined): number | null {
  const spec = period ? reportPeriods[period as ReportPeriod] : undefined;
  return spec ? Date.now() - spec.days * 24 * HOUR : null;
}

function inPeriod(request: ServiceRequest, since: number | null): boolean {
  return since === null || time(request.createdAt) >= since;
}

// Per-building rollup — the "cost and volume by building" the ops manager
// view reports on, and the scope list the sidebar narrows the queue by.
export interface RollupOptions {
  period?: string;
  type?: RequestType;
}

export async function getPropertyRollups({
  period,
  type = "maintenance",
}: RollupOptions = {}) {
  const since = raisedSince(period);

  return data.properties
    .map((property) => {
      const units = data.units.filter((u) => u.propertyId === property.id);
      const unitIds = new Set(units.map((u) => u.id));
      const all = data.requests.filter(
        (r) => unitIds.has(r.unitId) && r.type === type,
      );
      const open = all.filter((r) => r.stage !== "done");
      const raised = all.filter((r) => inPeriod(r, since));
      const spend = raised.reduce((sum, r) => sum + chargedOf(r), 0);

      return {
        ...property,
        units: units.length,
        requests: raised.length,
        open: open.length,
        unassigned: open.filter((r) => !r.assigneeId).length,
        spend,
        spendPerUnit: units.length ? spend / units.length : 0,
      };
    })
    .sort((a, b) => b.spend - a.spend || b.requests - a.requests);
}

// Spend and volume by category, for the two bar blocks on the dashboard.
// One trade at a time, since each portal reports on its own.
export interface CategoryRollup {
  category: Category;
  label: string;
  requests: number;
  spend: number;
}

export async function getCategoryRollups({
  period,
  type = "maintenance",
}: RollupOptions = {}): Promise<CategoryRollup[]> {
  const since = raisedSince(period);
  const totals = new Map<Category, CategoryRollup>();

  for (const request of data.requests) {
    if (request.type !== type) continue;
    if (!inPeriod(request, since)) continue;

    const entry = totals.get(request.category) ?? {
      category: request.category,
      label: categoryLabels[request.category] ?? request.category,
      requests: 0,
      spend: 0,
    };

    entry.requests += 1;
    entry.spend += chargedOf(request);
    totals.set(request.category, entry);
  }

  return [...totals.values()].sort((a, b) => b.requests - a.requests);
}

// The roster is deliberately thin: Ops PRD §9 makes the HRMS the system of
// record for staff identity in Phase 3, so everything here is either derived
// from request data or ops-owned (load, coverage). One trade at a time: ops
// manages the maintenance crew, the housekeeping portal its own.
export async function getStaffRoster({
  type = "maintenance",
}: { type?: RequestType } = {}) {
  return data.staff
    .filter((member) => member.role === type)
    .map((member) => {
      const assigned = data.requests.filter((r) => r.assigneeId === member.id);
      const open = assigned.filter((r) => r.stage !== "done");
      const closed = assigned.filter((r) => r.stage === "done");

      const propertyIds = new Set(
        assigned
          .map((r) => data.units.find((u) => u.id === r.unitId)?.propertyId)
          .filter((id): id is string => Boolean(id)),
      );

      return {
        ...member,
        load: open.length,
        capacity: staffCapacity,
        inProgress: open.filter((r) => r.stage === "in-progress").length,
        closed: closed.length,
        properties: [...propertyIds].map(
          (id) => data.properties.find((p) => p.id === id) ?? null,
        ),
      };
    })
    .sort((a, b) => b.load - a.load || a.name.localeCompare(b.name));
}

// Ranked candidates for the assign panel. The design ranks by certification,
// building presence, and load; ours reads those off the roster — role has to
// match the request type, then whoever is already working that building, then
// whoever has the most room left in their day.
export type RosterMember = Awaited<ReturnType<typeof getStaffRoster>>[number];

export async function getAssignmentCandidates(
  request: Pick<EnrichedRequest, "type" | "property" | "assigneeId">,
) {
  const roster = await getStaffRoster({ type: request.type });
  const propertyId = request.property?.id ?? null;

  return roster
    .filter((member) => member.role === request.type)
    .map((member) => {
      const inBuilding = member.properties.some((p) => p?.id === propertyId);
      const atCapacity = member.load >= member.capacity;

      return {
        ...member,
        inBuilding,
        atCapacity,
        isCurrent: member.id === request.assigneeId,
        // Capacity outweighs familiarity; familiarity outweighs a lighter day.
        score:
          (atCapacity ? -100 : 0) + (inBuilding ? 10 : 0) - member.load,
      };
    })
    .sort((a, b) => b.score - a.score);
}

// One trade at a time. The money splits the way the business does:
// maintenance spend is the landlord's, housekeeping is billed on to tenants,
// so the two never land on the same dashboard.
export async function getDashboardStats({
  period,
  type = "maintenance",
}: RollupOptions = {}) {
  const since = raisedSince(period);
  const all = data.requests.filter((r) => r.type === type).map(enrich);
  const raised = all.filter((request) => inPeriod(request, since));
  const open = all.filter((r) => r.stage !== "done");
  const closed = all.filter((r) => r.stage === "done");
  const spend = raised.reduce((sum, r) => sum + chargedOf(r), 0);

  return {
    open: open.length,
    unassigned: open.filter((r) => !r.assigneeId).length,
    inProgress: open.filter((r) => r.stage === "in-progress").length,
    closed: closed.length,
    byStage: stages.map((stage) => ({
      stage,
      count: all.filter((r) => r.stage === stage).length,
    })),
    raised: raised.length,
    urgentOpen: open.filter((r) => r.priority === "urgent").length,
    urgentBuildings: new Set(
      open.filter((r) => r.priority === "urgent").map((r) => r.property?.id),
    ).size,
    maintenanceSpend: spend,
    periodSpend: spend,
    costTrend: costByMonth(closed),
  };
}

// Charges rolled up by month — the "cost trends over time" the
// ops manager view calls for.
function costByMonth(closed: ServiceRequest[]) {
  const buckets = new Map<string, number>();

  for (const request of closed) {
    if (!request.charge) continue;
    const doneAt = stageAt(request, "done");
    if (!doneAt) continue;
    const month = doneAt.slice(0, 7);
    buckets.set(month, (buckets.get(month) ?? 0) + request.charge);
  }

  return [...buckets.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([month, total]) => ({ month, total }));
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

export async function getTenantById(id: string) {
  const tenant = data.tenants.find((t) => t.id === id);
  if (!tenant) return null;

  const unit = data.units.find((u) => u.tenantId === id) ?? null;
  const property = unit
    ? (data.properties.find((p) => p.id === unit.propertyId) ?? null)
    : null;

  return { ...tenant, unit, property };
}

// STUB: stands in for the signed-in session until auth exists. The Tenant
// Portal PRD specifies phone + OTP against accounts provisioned at lease
// signing; nothing here authenticates anyone. Replace this, not its callers.
export async function getSignedInTenant() {
  return getTenantById("ten-alhabsi");
}

// --- Tenant portal reads -------------------------------------------------
// The tenant sees a much narrower slice than ops: their own requests, the
// notifications those requests generated, and what they were charged.

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
    .sort((a, b) => time(b.at) - time(a.at));
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

export async function getProperties(): Promise<Property[]> {
  return data.properties;
}

export async function getStaff(): Promise<Staff[]> {
  return data.staff;
}

export async function getHousekeepingRates(): Promise<HousekeepingRate[]> {
  return data.housekeepingRates;
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
// The ops portal's forms go through here. Everything below mutates the store
// from `./store`, which is seeded from the same JSON the reads use, so a
// record created in the portal behaves exactly like one that shipped with it.
// Callers are server actions; they revalidate, this does not.

function stamp(): string {
  return new Date().toISOString();
}

function find(id: string): ServiceRequest | null {
  return data.requests.find((request) => request.id === id) ?? null;
}

// A stage is only ever reached once, so re-reaching one moves its timestamp
// rather than adding a second entry — `stageSteps` and the activity log both
// read the history as one row per stage.
function reachStage(request: ServiceRequest, stage: Stage, at: string) {
  const existing = request.stageHistory.find((entry) => entry.stage === stage);
  if (existing) {
    existing.at = at;
  } else {
    request.stageHistory.push({ stage, at });
  }
  request.stage = stage;
}

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
}: NewRequest): Promise<ServiceRequest> {
  const unit = data.units.find((u) => u.id === unitId);
  if (!unit) throw new Error(`Unknown unit ${unitId}`);
  if (!summary?.trim()) throw new Error("A request needs a summary");
  if (!categoryLabels[category]) throw new Error(`Unknown category ${category}`);
  if (scheduledSlot && !isValidScheduledSlot(scheduledSlot)) {
    throw new Error(`Unknown time slot ${scheduledSlot}`);
  }

  // The category decides the trade, and the trade decides who can be assigned
  // and who gets billed — so it is derived here rather than asked for twice.
  const type: RequestType = isMaintenanceCategory(category)
    ? "maintenance"
    : "housekeeping";

  // Housekeeping is booked at the rate card's price and keeps it: a later
  // change to the card never reprices a booking already made. It is booked
  // into a slot rather than raced against, so it carries no emergency.
  const rate =
    type === "housekeeping"
      ? data.housekeepingRates.find((r) => r.serviceType === category)
      : null;
  if (type === "housekeeping" && !rate) {
    throw new Error(`${categoryLabels[category]} is no longer on the rate card`);
  }

  const at = stamp();
  const request: ServiceRequest = {
    id: nextId("requests", "REQ"),
    unitId,
    tenantId: unit.tenantId ?? null,
    type,
    category,
    priority: type === "housekeeping" ? "normal" : priority,
    summary: summary.trim(),
    description: description.trim(),
    stage: "submitted",
    assigneeId: null,
    origin,
    createdAt: at,
    stageHistory: [{ stage: "submitted", at }],
    // Photos travel with the request the way the tenant portal's flow will
    // send them: name plus the bytes inline. There is no file store yet, so
    // they live in the same in-process copy everything else here does.
    photos: photos
      .filter((photo): photo is PhotoInput & { dataUrl: string } => Boolean(photo?.dataUrl))
      .slice(0, maxRequestPhotos)
      .map((photo) => ({
        name: photo.name ?? "Photo",
        dataUrl: photo.dataUrl,
      })),
    charge: rate ? rate.price : null,
    completionNotes: null,
    // Both or neither — a date with no window, or a window with no date,
    // isn't a booking.
    schedule:
      scheduledDate && scheduledSlot
        ? { date: scheduledDate, slot: scheduledSlot }
        : null,
  };

  data.requests.push(request);

  // Assigning here is the same move as assigning from the queue, just made
  // at creation time — so it goes through the one path that knows how to
  // validate a technician and carry the request into "assigned".
  if (assigneeId) await assignRequests(request.id, assigneeId);

  return request;
}

// Assigning is the one action that also moves a request forward: work nobody
// holds is still "submitted", and the moment someone holds it, it is not.
export async function assignRequests(
  ids: string | string[],
  assigneeId: string,
): Promise<ServiceRequest[]> {
  const member = data.staff.find((s) => s.id === assigneeId);
  if (!member) throw new Error(`Unknown staff member ${assigneeId}`);

  const at = stamp();
  const touched: ServiceRequest[] = [];

  for (const id of [ids].flat()) {
    const request = find(id);
    if (!request || request.stage === "done") continue;

    request.assigneeId = assigneeId;

    if (request.stage === "submitted") {
      reachStage(request, "assigned", at);
    } else {
      // Already in flight: a hand-over re-dates the assignment, it does not
      // send the request backwards.
      const assigned = request.stageHistory.find((e) => e.stage === "assigned");
      if (assigned) assigned.at = at;
    }

    touched.push(request);
  }

  return touched;
}

const priorities: Priority[] = ["urgent", "normal"];

// Takes a plain string because it is checked here rather than trusted.
export async function setPriority(
  ids: string | string[],
  priority: string,
): Promise<ServiceRequest[]> {
  if (!isPriority(priority)) {
    throw new Error(`Unknown priority ${priority}`);
  }

  const touched: ServiceRequest[] = [];
  for (const id of [ids].flat()) {
    const request = find(id);
    if (!request) continue;
    request.priority = priority;
    touched.push(request);
  }

  return touched;
}

// Removing a request takes it out of the queue entirely — the store has no
// archive to move it to, so there is nothing softer to do than this. Its
// charges leave the rollups with it.
export async function deleteRequests(
  ids: string | string[],
): Promise<ServiceRequest[]> {
  const wanted = new Set([ids].flat().filter(Boolean));
  const removed = data.requests.filter((request) => wanted.has(request.id));

  for (const request of removed) {
    data.requests.splice(data.requests.indexOf(request), 1);
  }

  return removed;
}

function slug(label: string): string {
  return label
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
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
  if (!label?.trim()) throw new Error("A rate needs a service name");

  const amount = Number(price);
  if (!Number.isFinite(amount) || amount <= 0) {
    throw new Error("A rate needs a price above zero");
  }

  const serviceType = slug(label);
  if (
    data.housekeepingRates.some((r) => r.serviceType === serviceType) ||
    isMaintenanceCategory(serviceType)
  ) {
    throw new Error(`${label.trim()} is already a service`);
  }

  const rate: HousekeepingRate = {
    serviceType,
    label: label.trim(),
    price: Math.round(amount),
  };
  data.housekeepingRates.push(rate);
  // A rate is only a real option once the queue can categorise against it.
  categoryLabels[serviceType] = rate.label;
  categoryCodes[serviceType] = rate.label.slice(0, 2).toUpperCase();
  return rate;
}

// A rate can only leave the card once nothing open is priced against it —
// a booking keeps the price it was made at, but a tenant cannot be left
// mid-service with a rate the card no longer lists.
export async function removeHousekeepingRate(
  serviceType: string,
): Promise<HousekeepingRate> {
  const index = data.housekeepingRates.findIndex(
    (rate) => rate.serviceType === serviceType,
  );
  if (index === -1) throw new Error(`Unknown service ${serviceType}`);

  const open = data.requests.filter(
    (request) => request.category === serviceType && request.stage !== "done",
  );
  if (open.length > 0) {
    throw new Error(
      `${open.length} open ${open.length === 1 ? "booking uses" : "bookings use"} this service — close them first`,
    );
  }

  const [rate] = data.housekeepingRates.splice(index, 1);
  // The label stays in the lookup so requests already charged against it keep
  // reading as themselves in the history.
  return rate;
}

// --- Staff ---------------------------------------------------------------
// Ops PRD §9 makes the HRMS the record for staff identity from Phase 3. Until
// then the roster is ops-owned and editable here, which is why only what ops
// actually decides — who they are and how to reach them — can be set.
// Ops manages the maintenance crew; the housekeeping portal manages its own.

const staffRoles: RequestType[] = ["maintenance", "housekeeping"];

function isRole(role: string): role is RequestType {
  return (staffRoles as string[]).includes(role);
}

function isPriority(priority: string): priority is Priority {
  return (priorities as string[]).includes(priority);
}

// Loose on purpose: numbers arrive in local and international formats, so
// this only refuses what cannot be dialled at all.
function cleanPhone(phone: string | null | undefined): string {
  const trimmed = phone?.trim() ?? "";
  const digits = trimmed.replace(/\D/g, "");
  if (!/^\+?[\d\s()-]+$/.test(trimmed) || digits.length < 7 || digits.length > 15) {
    throw new Error("Enter a valid mobile number");
  }
  return trimmed;
}

function staffId(name: string): string {
  const base = slug(name).split("-").filter(Boolean).pop() ?? "member";
  let candidate = `stf-${base}`;
  let suffix = 2;
  while (data.staff.some((member) => member.id === candidate)) {
    candidate = `stf-${base}-${suffix}`;
    suffix += 1;
  }
  return candidate;
}

// `photo` is a data URL, held with the member the way request photos are —
// there is no file store for either yet.
// Role arrives as a plain string from a form and is checked here.
export interface StaffInput {
  name: string;
  phone: string;
  role: string;
  photo?: string | null;
}

export async function addStaff({
  name,
  phone,
  role,
  photo = null,
}: StaffInput): Promise<Staff> {
  if (!name?.trim()) throw new Error("A staff member needs a name");
  if (!isRole(role)) throw new Error(`Unknown trade ${role}`);

  const member: Staff = {
    id: staffId(name),
    name: name.trim(),
    phone: cleanPhone(phone),
    role,
    photo,
  };
  data.staff.push(member);
  return member;
}

// Leaving `photo` out keeps the one they have.
export async function updateStaff(
  id: string,
  { name, phone, role, photo }: StaffInput,
): Promise<Staff> {
  const member = data.staff.find((s) => s.id === id);
  if (!member) throw new Error(`Unknown staff member ${id}`);
  if (!name?.trim()) throw new Error("A staff member needs a name");
  if (!isRole(role)) throw new Error(`Unknown trade ${role}`);

  member.name = name.trim();
  member.phone = cleanPhone(phone);
  member.role = role;
  if (photo) member.photo = photo;
  return member;
}

// Work that is still open has to be somewhere, so a technician holding any
// cannot simply disappear from the roster.
export async function removeStaff(id: string): Promise<Staff> {
  const index = data.staff.findIndex((member) => member.id === id);
  if (index === -1) throw new Error(`Unknown staff member ${id}`);

  const open = data.requests.filter(
    (request) => request.assigneeId === id && request.stage !== "done",
  );
  if (open.length > 0) {
    throw new Error(
      open.length === 1
        ? "1 open request is still assigned — reassign it first"
        : `${open.length} open requests are still assigned — reassign them first`,
    );
  }

  const [member] = data.staff.splice(index, 1);
  return member;
}

// Everything the portal has created goes back to the seed. The prototype's
// data lives in one process, so this is the only way back to a known state.
export async function resetOperationsData() {
  resetStore();
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
  return data.staff.find((s) => s.id === "stf-haddad") ?? data.staff[0] ?? null;
}

// Work already started outranks work that has not been — a technician
// standing in the unit finishes what they are holding — and an emergency
// outranks a standard job. Nothing else about the order is knowable: a
// request carries no duration, and only an ops-booked one carries a slot, so
// the remaining tie breaks the way the ops queue breaks it, oldest first.
const worklistStages: Partial<Record<Stage, number>> = {
  "in-progress": 0,
  assigned: 1,
  submitted: 2,
};

function byWorkOrder(a: ServiceRequest, b: ServiceRequest): number {
  return (
    (worklistStages[a.stage] ?? 3) - (worklistStages[b.stage] ?? 3) ||
    (a.priority === "urgent" ? 0 : 1) - (b.priority === "urgent" ? 0 : 1) ||
    time(a.createdAt) - time(b.createdAt)
  );
}

// A unit that keeps failing the same way is the one thing worth telling a
// technician before they start, because the repair that keeps not holding is
// a different job from the one on the ticket. Read off the same rule the ops
// portal flags a unit with, narrowed to this request's own category.
function repeatFaultOn(request: ServiceRequest, now: number): RepeatFault | null {
  if (request.type !== "maintenance") return null;

  const history = data.requests.filter(
    (r) => r.unitId === request.unitId && r.type === "maintenance",
  );
  const fault = repeatFaultFor(history, now);

  return fault?.category === request.category ? fault : null;
}

// Everything the worklist screen puts on the glass, already split the way it
// is drawn: one job led with, the rest queued behind it, and what is closed.
export interface Job extends EnrichedRequest {
  repeatFault: RepeatFault | null;
}

export interface Worklist {
  technician: Staff;
  next: Job | null;
  queued: Job[];
  closed: Job[];
  counts: { left: number; urgent: number; closed: number };
}

export async function getWorklist(technicianId: string): Promise<Worklist | null> {
  const technician = data.staff.find((s) => s.id === technicianId);
  if (!technician) return null;

  const now = Date.now();
  const mine = data.requests
    .filter((request) => request.assigneeId === technicianId)
    .map(enrich)
    .map((request): Job => ({ ...request, repeatFault: repeatFaultOn(request, now) }));

  const open = mine.filter((r) => r.stage !== "done").sort(byWorkOrder);
  const closed = mine
    .filter((r) => r.stage === "done")
    .sort((a, b) => time(stageAt(b, "done") ?? "") - time(stageAt(a, "done") ?? ""));

  return {
    technician,
    next: open[0] ?? null,
    queued: open.slice(1),
    closed,
    counts: {
      left: open.length,
      urgent: open.filter((r) => r.priority === "urgent").length,
      closed: closed.length,
    },
  };
}

// One job, and only if it is this technician's. Everything the field app
// renders goes through here rather than `getRequestById`, so a job that has
// been reassigned out from under someone stops resolving for them.
export async function getJob(id: string, technicianId: string): Promise<Job | null> {
  const request = await getRequestById(id);
  if (!request || request.assigneeId !== technicianId) return null;

  return { ...request, repeatFault: repeatFaultOn(request, Date.now()) };
}

// --- Field app writes ----------------------------------------------------
// A technician only ever touches work that is theirs. There is no session to
// enforce that for them, so each write checks the holder itself rather than
// trusting the id a form posted.

function heldBy(id: string, technicianId: string): ServiceRequest {
  const request = find(id);
  if (!request) throw new Error(`Unknown job ${id}`);
  if (request.assigneeId !== technicianId) {
    throw new Error("That job is not yours to change");
  }
  if (request.stage === "done") throw new Error("That job is already closed");
  return request;
}

// Arriving on site. Idempotent: tapping start on a job already under way is
// the technician confirming where they are, not a second event.
export async function startRequest(
  id: string,
  technicianId: string,
): Promise<ServiceRequest> {
  const request = heldBy(id, technicianId);

  if (request.stage !== "in-progress") {
    reachStage(request, "in-progress", stamp());
  }

  return request;
}

// How many photos close a job, and how many of those are compulsory. A
// minimum is required because closing work with no evidence of it is the
// thing the screen exists to prevent, but the photos are not tied to a
// before/after pair — the technician just attaches what shows the work is
// done. They inline with the request the way every other photo here does, so
// the cap is also what keeps the store a sensible size.
export const maxCompletionPhotos = 10;
export const requiredCompletionPhotos = 2;

export async function completeRequest(
  id: string,
  technicianId: string,
  {
    notes = "",
    photos = [],
  }: { notes?: string; photos?: (PhotoInput | null | undefined)[] } = {},
): Promise<ServiceRequest> {
  const request = heldBy(id, technicianId);

  if (request.stage !== "in-progress") {
    throw new Error("Start the job before closing it");
  }

  const evidence = photos.filter(
    (photo): photo is PhotoInput & { dataUrl: string } => Boolean(photo?.dataUrl),
  );
  if (evidence.length < requiredCompletionPhotos) {
    throw new Error(
      `${requiredCompletionPhotos} photos are needed to close a job`,
    );
  }

  // Kept apart from `photos`, which are the fault as the tenant reported it.
  // These are the work as the technician left it, and the two are read for
  // different reasons.
  request.completionPhotos = evidence
    .slice(0, maxCompletionPhotos)
    .map((photo) => ({ name: photo.name ?? "Photo", dataUrl: photo.dataUrl }));
  request.completionNotes = notes.trim() || null;

  // `charge` is deliberately untouched. A housekeeping booking has carried
  // its price since `createRequest` read it off the rate card, and
  // maintenance is the landlord's cost and is never billed on — so there is
  // no number here for a technician to type, which is the whole point of
  // stating the total to them before they close.
  reachStage(request, "done", stamp());

  return request;
}

// "Can't do it" — neither a refusal nor a new stage. Work nobody holds is
// "submitted", and unassigned work is exactly where the ops queue reads its
// pressure from, so a job handed back returns to where it already sat before
// anyone held it, carrying why. The assignment leaves the history with the
// assignee: a request must not read as having reached a stage it is now
// behind.
export async function handBackRequest(
  id: string,
  technicianId: string,
  { reason }: { reason?: string } = {},
): Promise<ServiceRequest> {
  const request = heldBy(id, technicianId);
  if (!reason?.trim()) throw new Error("Say why you can't do it");

  const member = data.staff.find((s) => s.id === technicianId);

  request.handBack = {
    reason: reason.trim(),
    by: technicianId,
    byName: member?.name ?? null,
    at: stamp(),
  };
  request.assigneeId = null;
  request.stageHistory = request.stageHistory.filter(
    (entry) => entry.stage === "submitted",
  );
  request.stage = "submitted";

  return request;
}
