import data from "../data/operations.json";

// Single seam between the ops UI and wherever operations data actually lives.
// Today it reads a local JSON file; swap the bodies for API/DB calls later and
// no page has to change. Mirrors the approach in `./properties`.

export const stages = ["submitted", "assigned", "in-progress", "done"];

export const stageLabels = {
  submitted: "Submitted",
  assigned: "Assigned",
  "in-progress": "In progress",
  done: "Done",
};

// Badge tones come from the design system's stage colour tokens.
export const stageTones = {
  submitted: "neutral",
  assigned: "info",
  "in-progress": "warning",
  done: "success",
};

export const typeLabels = {
  maintenance: "Maintenance",
  housekeeping: "Housekeeping",
};

export const categoryLabels = {
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
export const categoryCodes = {
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
export const maintenanceCategories = [
  "ac",
  "plumbing",
  "electrical",
  "appliance",
  "other",
];

const HOUR = 1000 * 60 * 60;

function stageAt(request, stage) {
  return request.stageHistory.find((entry) => entry.stage === stage)?.at ?? null;
}

function hoursBetween(from, to) {
  return (new Date(to).getTime() - new Date(from).getTime()) / HOUR;
}

function enrich(request) {
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
  };
}

// The queue leads with the work that came in first; `newest` flips it.
const sorters = {
  age: (a, b) => new Date(a.createdAt) - new Date(b.createdAt),
  newest: (a, b) => new Date(b.createdAt) - new Date(a.createdAt),
};

// Free-text match across the fields an admin actually types: the ref, the
// unit, the tenant, and the summary.
function matchesSearch(request, term) {
  return [
    request.id,
    request.summary,
    request.unit?.label,
    request.property?.name,
    request.tenant?.name,
    request.assignee?.name,
  ]
    .filter(Boolean)
    .some((field) => field.toLowerCase().includes(term));
}

export async function getRequests({
  stage,
  type,
  category,
  priority,
  propertyId,
  unitId,
  assigneeId,
  tenantId,
  open,
  search,
  sort = "age",
} = {}) {
  const term = search?.trim().toLowerCase();

  return data.requests
    .map(enrich)
    .filter((request) => {
      if (stage && request.stage !== stage) return false;
      if (type && request.type !== type) return false;
      if (category && request.category !== category) return false;
      if (priority && request.priority !== priority) return false;
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

export async function getRequestById(id) {
  const request = data.requests.find((r) => r.id === id);
  return request ? enrich(request) : null;
}

// Previous / next within the queue's own order, so paging through the detail
// screen walks the same list the admin was just looking at.
export async function getRequestNeighbours(id, filters = {}) {
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

export async function getRequestIds() {
  return data.requests.map((r) => r.id);
}

// Per-unit service history — Ops PRD §7: an admin should see what's happened
// in a unit before assigning new work.
export async function getUnitHistory(unitId, { excludeId } = {}) {
  return data.requests
    .filter((r) => r.unitId === unitId && r.id !== excludeId)
    .map(enrich)
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
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

function repeatFaultFor(requests, now) {
  const cutoff = now - repeatFaultRule.withinDays * 24 * HOUR;
  const counts = new Map();

  for (const request of requests) {
    // Housekeeping recurring is the service working, not a fault.
    if (request.type !== "maintenance") continue;
    if (new Date(request.createdAt).getTime() < cutoff) continue;
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
      .reduce((sum, r) => sum + (r.charge ?? 0), 0),
  };
}

function enrichUnit(unit, now) {
  const requests = data.requests.filter((r) => r.unitId === unit.id);
  const done = requests.filter((r) => r.stage === "done");

  const lastServicedAt = done
    .map((r) => stageAt(r, "done"))
    .sort((a, b) => new Date(b) - new Date(a))[0] ?? null;

  return {
    ...unit,
    property: data.properties.find((p) => p.id === unit.propertyId) ?? null,
    tenant: unit.tenantId
      ? (data.tenants.find((t) => t.id === unit.tenantId) ?? null)
      : null,
    requestCount: requests.length,
    openCount: requests.filter((r) => r.stage !== "done").length,
    lifetimeSpend: requests.reduce((sum, r) => sum + (r.charge ?? 0), 0),
    lastServicedAt,
    repeatFault: repeatFaultFor(requests, now),
  };
}

export async function getUnits({ propertyId } = {}) {
  const now = Date.now();

  return data.units
    .filter((unit) => !propertyId || unit.propertyId === propertyId)
    .map((unit) => enrichUnit(unit, now))
    .sort(
      (a, b) =>
        b.openCount - a.openCount ||
        (a.property?.name ?? "").localeCompare(b.property?.name ?? "") ||
        a.label.localeCompare(b.label),
    );
}

export async function getUnitById(id) {
  const unit = data.units.find((u) => u.id === id);
  return unit ? enrichUnit(unit, Date.now()) : null;
}

export async function getUnitIds() {
  return data.units.map((u) => u.id);
}

// The dashboard reports over a window; the queue and the sidebar do not.
// Anything counted as "raised" or "spent" is period-scoped, while open work
// is open regardless of when it came in.
export const reportPeriods = {
  month: { label: "This month", days: 30 },
  quarter: { label: "Quarter", days: 90 },
  year: { label: "Year", days: 365 },
};

function raisedSince(period) {
  const spec = reportPeriods[period];
  return spec ? Date.now() - spec.days * 24 * HOUR : null;
}

function inPeriod(request, since) {
  return since === null || new Date(request.createdAt).getTime() >= since;
}

// Per-building rollup — the "cost and volume by building" the ops manager
// view reports on, and the scope list the sidebar narrows the queue by.
export async function getPropertyRollups({ period } = {}) {
  const since = raisedSince(period);

  return data.properties
    .map((property) => {
      const units = data.units.filter((u) => u.propertyId === property.id);
      const unitIds = new Set(units.map((u) => u.id));
      const all = data.requests.filter((r) => unitIds.has(r.unitId));
      const open = all.filter((r) => r.stage !== "done");
      const raised = all.filter((r) => inPeriod(r, since));
      const spend = raised.reduce((sum, r) => sum + (r.charge ?? 0), 0);

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
export async function getCategoryRollups({ period } = {}) {
  const since = raisedSince(period);
  const totals = new Map();

  for (const request of data.requests) {
    if (!inPeriod(request, since)) continue;

    const entry = totals.get(request.category) ?? {
      category: request.category,
      label: categoryLabels[request.category] ?? request.category,
      type: request.type,
      requests: 0,
      spend: 0,
    };

    entry.requests += 1;
    entry.spend += request.charge ?? 0;
    totals.set(request.category, entry);
  }

  return [...totals.values()].sort((a, b) => b.requests - a.requests);
}

// The roster is deliberately thin: Ops PRD §9 makes the HRMS the system of
// record for staff identity in Phase 3, so everything here is either derived
// from request data or ops-owned (load, coverage).
export async function getStaffRoster() {
  return data.staff
    .map((member) => {
      const assigned = data.requests.filter((r) => r.assigneeId === member.id);
      const open = assigned.filter((r) => r.stage !== "done");
      const closed = assigned.filter((r) => r.stage === "done");

      const propertyIds = new Set(
        assigned
          .map((r) => data.units.find((u) => u.id === r.unitId)?.propertyId)
          .filter(Boolean),
      );

      return {
        ...member,
        load: open.length,
        capacity: staffCapacity,
        closed: closed.length,
        properties: [...propertyIds].map((id) =>
          data.properties.find((p) => p.id === id),
        ),
      };
    })
    .sort((a, b) => b.load - a.load || a.name.localeCompare(b.name));
}

// Ranked candidates for the assign panel. The design ranks by certification,
// building presence, and load; ours reads those off the roster — role has to
// match the request type, then whoever is already working that building, then
// whoever has the most room left in their day.
export async function getAssignmentCandidates(request) {
  const roster = await getStaffRoster();
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

export async function getDashboardStats({ period } = {}) {
  const since = raisedSince(period);
  const all = data.requests.map(enrich);
  const raised = all.filter((request) => inPeriod(request, since));
  const open = all.filter((r) => r.stage !== "done");
  const closed = all.filter((r) => r.stage === "done");

  return {
    open: open.length,
    unassigned: open.filter((r) => !r.assigneeId).length,
    inProgress: open.filter((r) => r.stage === "in-progress").length,
    closed: closed.length,
    byStage: stages.map((stage) => ({
      stage,
      count: all.filter((r) => r.stage === stage).length,
    })),
    // Open work only — "done" is not a place work is sitting.
    openByStage: stages
      .filter((stage) => stage !== "done")
      .map((stage) => ({
        stage,
        label: stageLabels[stage],
        count: open.filter((r) => r.stage === stage).length,
      })),
    raised: raised.length,
    urgentOpen: open.filter((r) => r.priority === "urgent").length,
    urgentBuildings: new Set(
      open.filter((r) => r.priority === "urgent").map((r) => r.property?.id),
    ).size,
    periodSpend: raised.reduce((sum, r) => sum + (r.charge ?? 0), 0),
    costTrend: costByMonth(closed),
    // Open emergencies, the ones nobody has picked up first.
    emergencies: open
      .filter((r) => r.priority === "urgent")
      .sort(
        (a, b) =>
          Number(Boolean(a.assigneeId)) - Number(Boolean(b.assigneeId)) ||
          new Date(a.createdAt) - new Date(b.createdAt),
      )
      .slice(0, 5),
  };
}

// Housekeeping charges rolled up by month — the "cost trends over time" the
// ops manager view calls for.
function costByMonth(closed) {
  const buckets = new Map();

  for (const request of closed) {
    if (!request.charge) continue;
    const doneAt = stageAt(request, "done");
    const month = doneAt.slice(0, 7);
    buckets.set(month, (buckets.get(month) ?? 0) + request.charge);
  }

  return [...buckets.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([month, total]) => ({ month, total }));
}

// Maps a request's stage history onto the shape `@aqarly/ui/Timeline` renders.
export function stageSteps(request) {
  const reached = new Map(
    request.stageHistory.map((entry) => [entry.stage, entry.at]),
  );
  const currentIndex = stages.indexOf(request.stage);

  return stages.map((stage, index) => ({
    label: stageLabels[stage],
    caption: reached.has(stage) ? formatDateTime(reached.get(stage)) : "—",
    state:
      index < currentIndex ? "done" : index === currentIndex ? "current" : "todo",
  }));
}

export async function getTenantById(id) {
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

function notificationsFor(request) {
  const { assignee, summary, type, charge, completionNotes } = request;
  const who = assignee?.name;

  const copy = {
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
export async function getTenantNotifications(tenantId, { now = Date.now() } = {}) {
  const requests = await getRequests({ tenantId });

  return requests
    .flatMap(notificationsFor)
    .map((notification) => ({
      ...notification,
      unread: hoursBetween(notification.at, now) < 24,
    }))
    .sort((a, b) => new Date(b.at) - new Date(a.at));
}

function monthLabel(month) {
  return new Intl.DateTimeFormat("en", {
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(`${month}-01T00:00:00Z`));
}

// Completed work for one tenant, bucketed by the month it was completed in,
// with the housekeeping charges for that month already totalled.
export async function getTenantHistory(tenantId, { type } = {}) {
  const requests = await getRequests({ tenantId, type, stage: "done" });
  const buckets = new Map();

  for (const request of requests) {
    const doneAt = stageAt(request, "done");
    const month = doneAt.slice(0, 7);

    if (!buckets.has(month)) {
      buckets.set(month, {
        month,
        label: monthLabel(month),
        items: [],
        housekeepingTotal: 0,
      });
    }

    const bucket = buckets.get(month);
    bucket.items.push({ ...request, completedAt: doneAt });
    if (request.type === "housekeeping") bucket.housekeepingTotal += request.charge ?? 0;
  }

  return [...buckets.values()]
    .sort((a, b) => b.month.localeCompare(a.month))
    .map((bucket) => ({
      ...bucket,
      items: bucket.items.sort((a, b) => new Date(b.completedAt) - new Date(a.completedAt)),
    }));
}

export async function getProperties() {
  return data.properties;
}

export async function getStaff() {
  return data.staff;
}

export async function getHousekeepingRates() {
  return data.housekeepingRates;
}

export function formatCharge(amount, currency = "AED") {
  if (!amount) return "—";
  return new Intl.NumberFormat("en", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(amount);
}

// Day-level formatting for tiles and columns where a timestamp is more
// precision than the reader needs.
export function formatDate(iso) {
  return new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
    timeZone: "UTC",
  }).format(new Date(iso));
}

export function formatDateTime(iso) {
  return new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "UTC",
  }).format(new Date(iso));
}
