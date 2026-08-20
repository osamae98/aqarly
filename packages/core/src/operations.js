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

// Ops PRD §7 wants these admin-configurable rather than hardcoded. MVP scope
// allows fixed targets to start, so they live here as one table to lift into
// admin settings later. Hours from submission.
export const slaTargets = {
  maintenance: {
    urgent: { respond: 4, resolve: 24 },
    normal: { respond: 24, resolve: 72 },
  },
  housekeeping: {
    urgent: { respond: 4, resolve: 24 },
    normal: { respond: 24, resolve: 96 },
  },
};

const HOUR = 1000 * 60 * 60;

function stageAt(request, stage) {
  return request.stageHistory.find((entry) => entry.stage === stage)?.at ?? null;
}

function hoursBetween(from, to) {
  return (new Date(to).getTime() - new Date(from).getTime()) / HOUR;
}

export function targetFor(request) {
  return slaTargets[request.type][request.priority] ?? slaTargets[request.type].normal;
}

// Open requests resolve to on-track / at-risk / overdue; closed ones to the
// historical met / breached, so the dashboard can report both live pressure
// and past adherence off the same function.
export function computeSla(request, now = Date.now()) {
  const target = targetFor(request);
  const doneAt = stageAt(request, "done");

  if (request.stage === "done") {
    const elapsed = hoursBetween(request.createdAt, doneAt);
    return {
      state: elapsed <= target.resolve ? "met" : "breached",
      elapsedHours: elapsed,
      targetHours: target.resolve,
    };
  }

  const elapsed = hoursBetween(request.createdAt, now);
  const awaitingAssignment = request.stage === "submitted";
  const breachedResponse = awaitingAssignment && elapsed > target.respond;

  let state = "on-track";
  if (elapsed > target.resolve || breachedResponse) {
    state = "overdue";
  } else if (elapsed > target.resolve * 0.75) {
    state = "at-risk";
  }

  return {
    state,
    elapsedHours: elapsed,
    targetHours: target.resolve,
    breachedResponse,
  };
}

export const slaLabels = {
  "on-track": "On track",
  "at-risk": "At risk",
  overdue: "Overdue",
  met: "Met",
  breached: "Breached",
};

export const slaTones = {
  "on-track": "success",
  "at-risk": "warning",
  overdue: "danger",
  met: "success",
  breached: "danger",
};

function enrich(request, now) {
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
    sla: computeSla(request, now),
    ageHours: hoursBetween(request.createdAt, now),
  };
}

const sorters = {
  age: (a, b) => b.ageHours - a.ageHours,
  newest: (a, b) => a.ageHours - b.ageHours,
  sla: (a, b) => b.sla.elapsedHours / b.sla.targetHours - a.sla.elapsedHours / a.sla.targetHours,
};

export async function getRequests({
  stage,
  type,
  propertyId,
  sla,
  assigneeId,
  tenantId,
  open,
  sort = "age",
} = {}) {
  const now = Date.now();

  return data.requests
    .map((request) => enrich(request, now))
    .filter((request) => {
      if (stage && request.stage !== stage) return false;
      if (type && request.type !== type) return false;
      if (propertyId && request.property?.id !== propertyId) return false;
      if (sla && request.sla.state !== sla) return false;
      if (assigneeId && request.assigneeId !== assigneeId) return false;
      if (tenantId && request.tenantId !== tenantId) return false;
      if (open && request.stage === "done") return false;
      return true;
    })
    .sort(sorters[sort] ?? sorters.age);
}

export async function getRequestById(id) {
  const request = data.requests.find((r) => r.id === id);
  return request ? enrich(request, Date.now()) : null;
}

export async function getRequestIds() {
  return data.requests.map((r) => r.id);
}

// Per-unit service history — Ops PRD §7: an admin should see what's happened
// in a unit before assigning new work.
export async function getUnitHistory(unitId, { excludeId } = {}) {
  const now = Date.now();

  return data.requests
    .filter((r) => r.unitId === unitId && r.id !== excludeId)
    .map((request) => enrich(request, now))
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
}

export async function getDashboardStats() {
  const now = Date.now();
  const all = data.requests.map((request) => enrich(request, now));
  const open = all.filter((r) => r.stage !== "done");
  const closed = all.filter((r) => r.stage === "done");

  const resolutionHours = closed
    .map((r) => r.sla.elapsedHours)
    .sort((a, b) => a - b);
  const median = resolutionHours.length
    ? resolutionHours[Math.floor(resolutionHours.length / 2)]
    : null;

  return {
    open: open.length,
    unassigned: open.filter((r) => r.stage === "submitted").length,
    inProgress: open.filter((r) => r.stage === "in-progress").length,
    overdue: open.filter((r) => r.sla.state === "overdue").length,
    atRisk: open.filter((r) => r.sla.state === "at-risk").length,
    byStage: stages.map((stage) => ({
      stage,
      count: all.filter((r) => r.stage === stage).length,
    })),
    slaAdherence: closed.length
      ? closed.filter((r) => r.sla.state === "met").length / closed.length
      : null,
    medianResolutionHours: median,
    costTrend: costByMonth(closed),
    needsAttention: open
      .filter((r) => r.sla.state === "overdue" || r.sla.state === "at-risk")
      .sort(sorters.sla)
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

export function formatAge(hours) {
  if (hours < 1) return "just now";
  if (hours < 24) return `${Math.floor(hours)}h`;
  return `${Math.floor(hours / 24)}d`;
}

export function formatDateTime(iso) {
  return new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "UTC",
  }).format(new Date(iso));
}
