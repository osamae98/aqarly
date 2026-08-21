import Link from "next/link";
import {
  formatCharge,
  formatDateTime,
  getSignedInTenant,
  getTenantHistory,
} from "@aqarly/core/operations";
import EmptyState from "@/components/EmptyState";
import FilterChips from "@/components/FilterChips";
import Screen from "@/components/Screen";
import SectionLabel from "@/components/SectionLabel";
import { Broom, CreditCard, Wrench } from "@/components/icons";

export const metadata = { title: "History" };

const filters = [
  { label: "All", value: null },
  { label: "Maintenance", value: "maintenance" },
  { label: "Housekeeping", value: "housekeeping" },
];

export default async function HistoryPage({ searchParams }) {
  const { type } = await searchParams;
  // Anything that isn't a filter we offer falls back to the unfiltered view
  // rather than rendering an empty screen for a typo'd URL.
  const active = filters.some((filter) => filter.value === type) ? type : null;

  const tenant = await getSignedInTenant();
  const months = await getTenantHistory(tenant.id, { type: active ?? undefined });

  return (
    <Screen title="History">
      <FilterChips
        basePath="/history"
        name="type"
        options={filters}
        active={active}
      />

      {months.length === 0 ? (
        <div className="flex flex-1 items-center justify-center">
          <EmptyState
            tone="neutral"
            icon={<CreditCard size={32} />}
            title="Nothing here yet"
            description="Completed work and any housekeeping charges will appear here once a request is closed."
          />
        </div>
      ) : (
        <div className="mt-5 flex flex-col gap-6">
          {months.map((month) => (
            <section key={month.month}>
              <SectionLabel className="mb-3">{month.label}</SectionLabel>
              <div className="flex flex-col gap-3">
                {month.items.map((request) => (
                  <HistoryRow key={request.id} request={request} />
                ))}
              </div>
              {month.housekeepingTotal > 0 && (
                <div className="mt-4 flex items-baseline justify-between rounded-md bg-sunken p-4">
                  <SectionLabel>Housekeeping total</SectionLabel>
                  <span className="text-lg font-bold text-ink">
                    {formatCharge(month.housekeepingTotal)}
                  </span>
                </div>
              )}
            </section>
          ))}
        </div>
      )}
    </Screen>
  );
}

function HistoryRow({ request }) {
  const isHousekeeping = request.type === "housekeeping";
  const Icon = isHousekeeping ? Broom : Wrench;

  return (
    <Link
      href={`/requests/${request.id}`}
      className="flex items-start gap-3 rounded-md border border-border bg-surface p-4 transition-colors hover:bg-sunken"
    >
      <span
        className={[
          "flex size-9 shrink-0 items-center justify-center rounded-md",
          isHousekeeping
            ? "bg-category-housekeeping-tint text-category-housekeeping"
            : "bg-category-maintenance-tint text-category-maintenance",
        ].join(" ")}
      >
        <Icon size={17} />
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold text-ink">{request.summary}</p>
        <p className="mt-1 text-xs text-ink-muted">
          {formatDateTime(request.completedAt)}
        </p>
      </div>
      {request.charge ? (
        <span className="whitespace-nowrap text-base font-bold text-ink">
          {formatCharge(request.charge)}
        </span>
      ) : (
        <span className="whitespace-nowrap text-xs text-ink-muted">Included</span>
      )}
    </Link>
  );
}
