import Link from "next/link";
import DismissAlert from "@/components/DismissAlert";
import NewRequestAction from "@/components/NewRequestAction";
import PageBar from "@/components/PageBar";
import RequestRows from "@/components/RequestRows";
import SearchField from "@/components/SearchField";
import {
  categoryLabels,
  getPropertyRollups,
  getRequests,
  getStaffRoster,
  getUnits,
  maintenanceCategories,
  stageLabels,
  stages,
  tierLabels,
} from "@aqarly/core/operations";

export const metadata = {
  title: "Request queue",
};

// Header menus show how many rows each option would leave, counted against
// everything else the queue is currently filtered by.
function counter(all, key) {
  return (value) => all.filter((request) => key(request) === value).length;
}

// Paged rather than infinite — the queue is filtered and sorted server-side
// already, so a page is just a slice of that same, stable order.
const PAGE_SIZE = 50;

export default async function RequestQueuePage({ searchParams }) {
  const params = await searchParams;

  // The ops portal is maintenance-only, so every read here is scoped to it —
  // housekeeping bookings never surface in this queue.
  const query = {
    type: "maintenance",
    stage: params.stage,
    category: params.category,
    tier: params.tier,
    propertyId: params.propertyId,
    unitId: params.unitId,
    assigneeId: params.assigneeId,
    search: params.q,
    sort: params.sort,
  };

  const [requests, unfiltered, properties, staff, units, unassignedUrgent] =
    await Promise.all([
      getRequests(query),
      getRequests({ type: "maintenance", search: params.q }),
      getPropertyRollups(),
      getStaffRoster(),
      getUnits(),
      getRequests({
        type: "maintenance",
        open: true,
        tier: "emergency",
        assigneeId: "unassigned",
      }),
    ]);

  // Every filter above already narrowed and sorted `requests`; paging just
  // windows that same list, so changing filters always lands back on page 1
  // rather than an index that no longer means anything.
  const pageCount = Math.max(1, Math.ceil(requests.length / PAGE_SIZE));
  const page = Math.min(Math.max(1, Number(params.page) || 1), pageCount);
  const pageRequests = requests.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const scope = properties.find((p) => p.id === params.propertyId);
  const byCategory = counter(unfiltered, (r) => r.category);
  const byProperty = counter(unfiltered, (r) => r.property?.id);
  const byTier = counter(unfiltered, (r) => r.tier);
  const byAssignee = counter(unfiltered, (r) => r.assigneeId);
  const byStage = counter(unfiltered, (r) => r.stage);

  // Only the categories actually in the queue, in the order they weigh on it.
  const categories = [...new Set(unfiltered.map((r) => r.category))].sort(
    (a, b) => byCategory(b) - byCategory(a),
  );

  const filters = {
    category: [
      { value: null, label: "All requests", count: unfiltered.length },
      ...categories.map((category) => ({
        value: category,
        label: categoryLabels[category] ?? category,
        count: byCategory(category),
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
    tier: [
      { value: null, label: "Any priority", count: unfiltered.length },
      ...["emergency", "standard"].map((tier) => ({
        value: tier,
        label: tierLabels[tier],
        count: byTier(tier),
      })),
    ],
    stage: [
      { value: null, label: "Any status", count: unfiltered.length },
      ...stages.map((stage) => ({
        value: stage,
        label: stageLabels[stage],
        count: byStage(stage),
      })),
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
    params.category && {
      label: optionLabel(filters.category, params.category),
      param: "category",
    },
    params.propertyId && {
      label: optionLabel(filters.property, params.propertyId),
      param: "propertyId",
    },
    params.tier && { label: optionLabel(filters.tier, params.tier), param: "tier" },
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
        <SearchField
          searchParams={params}
          basePath="/requests"
          placeholder="Search ref, unit, tenant…"
          ariaLabel="Search requests"
        />
        <NewRequestAction
          buildings={properties.map((property) => ({
            id: property.id,
            name: property.name,
            units: units
              .filter((unit) => unit.propertyId === property.id)
              .map((unit) => ({
                id: unit.id,
                label: unit.label,
                tenant: unit.tenant?.name ?? null,
              })),
          }))}
          categories={maintenanceCategories.map((category) => ({
            value: category,
            label: categoryLabels[category] ?? category,
          }))}
          staff={staff.map((member) => ({
            id: member.id,
            name: member.name,
            role: member.role,
            load: member.load,
            capacity: member.capacity,
          }))}
        />
      </PageBar>

      {/* The one thing that must never be scrolled past — dismissable, but
        * only until the count of what is unassigned changes. */}
      {unassignedUrgent.length > 0 && (
        <DismissAlert signature={`emergency-${unassignedUrgent.length}`}>
          <span className="text-sm text-warning-ink">
            {unassignedUrgent.length}{" "}
            {unassignedUrgent.length === 1 ? "emergency has" : "emergencies have"}{" "}
            nobody assigned.
          </span>
          <span className="flex-1" />
          <Link
            href="/requests?tier=emergency&assigneeId=unassigned"
            className="text-[13.5px] font-bold text-warning-ink underline"
          >
            Show them
          </Link>
        </DismissAlert>
      )}

      {chips.length > 0 && (
        <div className="flex flex-wrap items-center gap-2 px-4 pt-4 md:px-6">
          {chips.map((chip) => (
            <ChipLink key={chip.param} chip={chip} params={params} />
          ))}
        </div>
      )}

      <div className="min-h-0 flex-1 overflow-x-auto py-4 [scrollbar-width:thin] md:py-6 [&::-webkit-scrollbar]:h-2 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-border-strong [&::-webkit-scrollbar-track]:bg-transparent">
        <RequestRows
          requests={pageRequests}
          staff={staff}
          filters={filters}
          searchParams={params}
          page={page}
          pageCount={pageCount}
          pageSize={PAGE_SIZE}
          total={requests.length}
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
