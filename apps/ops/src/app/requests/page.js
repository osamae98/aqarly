import Link from "next/link";
import DismissAlert from "@/components/DismissAlert";
import Icon from "@aqarly/ui/Icon";
import NewRequestAction from "@/components/NewRequestAction";
import PageBar from "@/components/PageBar";
import RequestRows from "@/components/RequestRows";
import {
  categoryLabels,
  getPropertyRollups,
  getHousekeepingRates,
  getRequests,
  getStaffRoster,
  getUnits,
  maintenanceCategories,
  stageLabels,
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

export default async function RequestQueuePage({ searchParams }) {
  const params = await searchParams;

  const query = {
    stage: params.stage,
    type: params.type,
    category: params.category,
    tier: params.tier,
    propertyId: params.propertyId,
    unitId: params.unitId,
    assigneeId: params.assigneeId,
    search: params.q,
    sort: params.sort,
  };

  const [requests, unfiltered, properties, staff, units, rates, unassignedUrgent] =
    await Promise.all([
      getRequests(query),
      getRequests({ search: params.q }),
      getPropertyRollups(),
      getStaffRoster(),
      getUnits(),
      getHousekeepingRates(),
      getRequests({ open: true, tier: "emergency", assigneeId: "unassigned" }),
    ]);

  const scope = properties.find((p) => p.id === params.propertyId);
  const byCategory = counter(unfiltered, (r) => r.category);
  const byProperty = counter(unfiltered, (r) => r.property?.id);
  const byTier = counter(unfiltered, (r) => r.tier);
  const byAssignee = counter(unfiltered, (r) => r.assigneeId);

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
      ...["emergency", "standard", "scheduled"].map((tier) => ({
        value: tier,
        label: tierLabels[tier],
        count: byTier(tier),
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
        {/* Submitting is what applies the search, so the bar says so rather
          * than leaving Enter as the only way in. */}
        <form action="/requests" className="flex h-10 items-center gap-1.5 rounded-pill border border-border bg-page ps-4 pe-1 transition-[border-color,box-shadow] focus-within:border-brand focus-within:shadow-focus">
          <input
            type="search"
            name="q"
            defaultValue={params.q ?? ""}
            placeholder="Search ref, unit, tenant…"
            aria-label="Search requests"
            className="w-full min-w-0 bg-transparent text-[13.5px] text-ink placeholder:text-ink-muted focus:outline-none sm:w-52"
          />
          <button
            type="submit"
            aria-label="Search"
            className="flex size-8 shrink-0 cursor-pointer items-center justify-center rounded-pill bg-brand text-ink-inverse transition-colors hover:bg-brand-hover"
          >
            <Icon name="search" size={15} />
          </button>
        </form>
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
          // Maintenance trades plus whatever is on the housekeeping rate
          // card — the category is what decides which of the two a request is.
          categories={[
            ...maintenanceCategories.map((category) => ({
              value: category,
              label: categoryLabels[category] ?? category,
            })),
            ...rates.map((rate) => ({
              value: rate.serviceType,
              label: rate.label,
            })),
          ]}
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
