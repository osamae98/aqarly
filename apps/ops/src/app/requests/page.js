import Link from "next/link";
import PageBar from "@/components/PageBar";
import RequestRows from "@/components/RequestRows";
import {
  getPropertyRollups,
  getRequests,
  getStaffRoster,
  stageLabels,
  typeLabels,
} from "@aqarly/core/operations";

export const metadata = {
  title: "Request queue",
};

// Header menus show how many rows each option would leave, counted against
// everything else the queue is currently filtered by.
function counter(all, key) {
  return (value) => all.filter((request) => key(request) === value).length;
}

export default async function RequestQueuePage({ searchParams }) {
  const params = await searchParams;

  const query = {
    stage: params.stage,
    type: params.type,
    priority: params.priority,
    propertyId: params.propertyId,
    unitId: params.unitId,
    assigneeId: params.assigneeId,
    search: params.q,
    sort: params.sort,
  };

  const [requests, unfiltered, properties, staff, unassignedUrgent] =
    await Promise.all([
      getRequests(query),
      getRequests({ search: params.q }),
      getPropertyRollups(),
      getStaffRoster(),
      getRequests({ open: true, priority: "urgent", assigneeId: "unassigned" }),
    ]);

  const scope = properties.find((p) => p.id === params.propertyId);
  const byType = counter(unfiltered, (r) => r.type);
  const byProperty = counter(unfiltered, (r) => r.property?.id);
  const byPriority = counter(unfiltered, (r) => r.priority);
  const byAssignee = counter(unfiltered, (r) => r.assigneeId);

  const filters = {
    type: [
      { value: null, label: "All requests", count: unfiltered.length },
      ...["maintenance", "housekeeping"].map((type) => ({
        value: type,
        label: typeLabels[type],
        count: byType(type),
      })),
    ],
    property: [
      { value: null, label: "All buildings", count: unfiltered.length },
      ...properties.map((property) => ({
        value: property.id,
        label: property.name,
        count: byProperty(property.id),
      })),
    ],
    priority: [
      { value: null, label: "Any priority", count: unfiltered.length },
      { value: "urgent", label: "Emergency", count: byPriority("urgent") },
      { value: "normal", label: "Standard", count: byPriority("normal") },
    ],
    assignee: [
      { value: null, label: "Anyone", count: unfiltered.length },
      {
        value: "unassigned",
        label: "Unassigned",
        count: unfiltered.filter((r) => !r.assigneeId).length,
      },
      ...staff.map((member) => ({
        value: member.id,
        label: member.name,
        count: byAssignee(member.id),
      })),
    ],
  };

  // Every filter in play gets a chip, including the ones the emergency banner
  // sets — nothing narrows the queue without something visible to undo it.
  const optionLabel = (options, value) =>
    options.find((option) => option.value === value)?.label ?? value;

  const chips = [
    params.q && { label: `“${params.q}”`, param: "q" },
    params.stage && { label: stageLabels[params.stage], param: "stage" },
    params.type && { label: optionLabel(filters.type, params.type), param: "type" },
    params.propertyId && {
      label: optionLabel(filters.property, params.propertyId),
      param: "propertyId",
    },
    params.priority && {
      label: optionLabel(filters.priority, params.priority),
      param: "priority",
    },
    params.assigneeId && {
      label: optionLabel(filters.assignee, params.assigneeId),
      param: "assigneeId",
    },
    params.unitId && {
      label: `Unit ${requests[0]?.unit?.label ?? params.unitId}`,
      param: "unitId",
    },
    params.sort && { label: sortLabels[params.sort], param: "sort" },
  ].filter(Boolean);

  return (
    <>
      <PageBar
        title="Service requests"
        meta={
          scope
            ? `${scope.name} · ${scope.units} units · ${scope.open} open`
            : `${properties.length} buildings · ${properties.reduce((sum, p) => sum + p.units, 0)} units`
        }
      >
        <form action="/requests" className="contents">
          <input
            type="search"
            name="q"
            defaultValue={params.q ?? ""}
            placeholder="Search ref, unit, tenant…"
            aria-label="Search requests"
            className="h-10 w-full rounded-pill border border-border bg-page px-4 text-[13.5px] text-ink transition-[border-color,box-shadow] placeholder:text-ink-muted focus:border-brand focus:shadow-focus focus:outline-none sm:w-62"
          />
        </form>
        <span
          title="Requests are raised by tenants in their own portal"
          className="cursor-not-allowed rounded-pill bg-brand px-4.5 py-2.5 text-sm font-semibold text-ink-inverse opacity-45"
        >
          New request
        </span>
      </PageBar>

      {/* The one thing that must never be scrolled past. */}
      {unassignedUrgent.length > 0 && (
        <div className="bg-surface px-4 pt-4 pb-5 md:px-6">
          <div className="flex flex-wrap items-center gap-3 rounded-sm border border-[var(--amber-300)] bg-warning-tint px-3.5 py-2.5">
            <span className="flex size-4.5 shrink-0 items-center justify-center rounded-pill border-[1.5px] border-warning-ink text-[11px] leading-none font-bold text-warning-ink">
              !
            </span>
            <span className="text-[13.5px] text-warning-ink">
              {unassignedUrgent.length}{" "}
              {unassignedUrgent.length === 1 ? "emergency has" : "emergencies have"}{" "}
              nobody assigned.
            </span>
            <span className="flex-1" />
            <Link
              href="/requests?priority=urgent&assigneeId=unassigned"
              className="text-[13px] font-semibold text-warning-ink underline"
            >
              Show them
            </Link>
          </div>
        </div>
      )}

      {chips.length > 0 && (
        <div className="flex flex-wrap items-center gap-2 px-4 pt-4 md:px-6">
          {chips.map((chip) => (
            <ChipLink key={chip.param} chip={chip} params={params} />
          ))}
        </div>
      )}

      <div className="min-h-0 flex-1 overflow-x-auto pb-6">
        <RequestRows
          requests={requests}
          staff={staff}
          filters={filters}
          searchParams={params}
        />
      </div>
    </>
  );
}

const sortLabels = {
  newest: "Newest first",
  age: "Oldest first",
};

function ChipLink({ chip, params }) {
  const next = new URLSearchParams(
    Object.entries(params).filter(([, v]) => typeof v === "string"),
  );
  next.delete(chip.param);
  const query = next.toString();

  return (
    <Link
      href={query ? `/requests?${query}` : "/requests"}
      className="inline-flex items-center gap-1.5 rounded-pill bg-brand-tint px-3 py-1 text-xs font-medium text-brand"
    >
      {chip.label} ✕
    </Link>
  );
}
