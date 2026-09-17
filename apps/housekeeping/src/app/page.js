import Link from "next/link";
import Initials from "@/components/Initials";
import MeterRow from "@/components/MeterRow";
import PageBar from "@/components/PageBar";
import Panel from "@/components/Panel";
import Stat from "@/components/Stat";
import {
  formatCharge,
  getCategoryRollups,
  getDashboardStats,
  getPropertyRollups,
  getStaffRoster,
  reportPeriods,
  staffCapacity,
} from "@aqarly/core/operations";

export default async function HousekeepingDashboardPage({ searchParams }) {
  const params = await searchParams;
  const period = reportPeriods[params.period] ? params.period : "month";

  const [stats, categories, buildings, staff] = await Promise.all([
    getDashboardStats({ period, type: "housekeeping" }),
    getCategoryRollups({ period, type: "housekeeping" }),
    getPropertyRollups({ period, type: "housekeeping" }),
    getStaffRoster({ type: "housekeeping" }),
  ]);

  const totalUnits = buildings.reduce((sum, b) => sum + b.units, 0);
  const maxSpend = Math.max(...categories.map((c) => c.spend), 1);
  const maxVolume = Math.max(...categories.map((c) => c.requests), 1);
  const maxBuilding = Math.max(...buildings.map((b) => b.spend), 1);

  return (
    <>
      <PageBar
        title="Housekeeping overview"
        meta={`Portfolio · ${buildings.length} buildings · ${totalUnits} units · ${reportPeriods[period].label.toLowerCase()}`}
      >
        {/* The period control is real: everything counted as raised or spent
         * below is scoped by it. */}
        <div className="flex gap-1.5 rounded-pill bg-sunken p-1">
          {Object.entries(reportPeriods).map(([key, spec]) => (
            <Link
              key={key}
              href={key === "month" ? "/" : `/?period=${key}`}
              aria-current={key === period ? "true" : undefined}
              className={[
                "rounded-pill px-3.5 py-1.5 text-[13px] transition-colors",
                key === period
                  ? "bg-surface font-semibold text-ink shadow-sm"
                  : "text-ink-soft hover:text-ink",
              ].join(" ")}
            >
              {spec.label}
            </Link>
          ))}
        </div>
        <span
          title="Export needs a write path"
          className="cursor-not-allowed rounded-pill border border-border-strong px-4 py-2 text-[13.5px] font-semibold text-ink-soft opacity-45"
        >
          Export
        </span>
      </PageBar>

      <div className="flex flex-col gap-4.5 p-4 md:p-6">
        <div className="grid gap-3.5 sm:grid-cols-2 lg:grid-cols-3">
          <Stat
            label="Open bookings"
            value={stats.open}
            hint={`of ${stats.raised} booked ${reportPeriods[period].label.toLowerCase()}`}
          />
          {/* Housekeeping is booked into a slot rather than raced against, so
            * there is no emergency tier — what nobody holds is the pressure. */}
          <Stat
            label="Unassigned, open"
            value={stats.unassigned}
            tone={stats.unassigned > 0 ? "danger" : "neutral"}
            hint={`${stats.inProgress} in progress now`}
          />
          <Stat
            label="Housekeeping billed"
            value={formatCharge(stats.periodSpend)}
            hint={
              stats.periodSpend
                ? "Completed work · billed to tenants"
                : "Nothing billed yet"
            }
          />
        </div>

        <div className="grid gap-3.5 lg:grid-cols-2">
          <Panel
            title="Billed by service"
            caption={`${reportPeriods[period].label} · ${formatCharge(
              stats.periodSpend,
            )} total`}
            bodyClassName="flex flex-col gap-3.5"
          >
            {categories.filter((c) => c.spend > 0).length ? (
              categories
                .filter((category) => category.spend > 0)
                .map((category) => (
                  <MeterRow
                    key={category.category}
                    label={category.label}
                    value={formatCharge(category.spend)}
                    pct={(category.spend / maxSpend) * 100}
                  />
                ))
            ) : (
              <p className="text-sm text-ink-muted">
                Nothing was charged in this period.
              </p>
            )}
          </Panel>

          <Panel
            title="Bookings by service"
            caption={`${stats.raised} booked ${reportPeriods[period].label.toLowerCase()}`}
            bodyClassName="flex flex-col gap-3.5"
          >
            {categories.map((category) => (
              <MeterRow
                key={category.category}
                label={category.label}
                value={`${Math.round((category.requests / stats.raised) * 100)}%`}
                pct={(category.requests / maxVolume) * 100}
              />
            ))}
          </Panel>
        </div>

        <div className="grid gap-3.5 xl:grid-cols-3">
          <Panel
            className="xl:col-span-2"
            title="Billed and booked by building"
            caption="Sorted by amount billed"
            bodyClassName="flex flex-col"
          >
            <div className="grid grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)_56px_80px] gap-3 pb-2.5 text-[11px] font-bold tracking-[0.1em] uppercase text-ink-muted">
              <span>Building</span>
              <span>Billed</span>
              <span className="text-end">Jobs</span>
              <span className="text-end">Per unit</span>
            </div>
            {buildings.map((building) => (
              <Link
                key={building.id}
                href={`/requests?propertyId=${building.id}`}
                className="grid grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)_56px_80px] items-center gap-3 border-t border-sunken py-2.5 transition-colors hover:bg-page"
              >
                <span className="min-w-0">
                  <span className="block truncate text-[13.5px] font-semibold text-ink">
                    {building.name}
                  </span>
                  {building.unassigned > 0 && (
                    <span className="font-mono text-[11px] text-danger">
                      {building.unassigned} unassigned
                    </span>
                  )}
                </span>
                <span className="flex items-center gap-2.5">
                  {/* An empty track for a building with nothing spent yet
                    * reads as a bar with no data behind it — so only draw
                    * one where there is something to show. */}
                  {building.spend > 0 && (
                    <span className="h-2.5 flex-1 overflow-hidden rounded-pill bg-sunken">
                      <span
                        className="block h-full rounded-pill bg-brand"
                        style={{ width: `${(building.spend / maxBuilding) * 100}%` }}
                      />
                    </span>
                  )}
                  <span
                    className={[
                      "shrink-0 text-end font-mono text-[12.5px] font-semibold",
                      building.spend > 0 ? "w-16 text-ink" : "flex-1 text-ink-muted",
                    ].join(" ")}
                  >
                    {formatCharge(building.spend)}
                  </span>
                </span>
                <span className="text-end font-mono text-[13px] text-ink-soft">
                  {building.requests}
                </span>
                <span className="text-end font-mono text-[13px] text-ink-soft">
                  {formatCharge(Math.round(building.spendPerUnit))}
                </span>
              </Link>
            ))}
          </Panel>

          {/* The crew card is the one dark surface on the screen — it reads as
           * a different kind of fact from the money above it. */}
          <Panel
            tone="brand"
            title="Crew"
            caption={`Open jobs held · out of ${staffCapacity} each`}
            bodyClassName="flex flex-col gap-3"
          >
            {staff.map((member) => {
              const pct = Math.min(100, (member.load / member.capacity) * 100);

              return (
                <div key={member.id} className="flex items-center gap-2.5">
                  <Initials name={member.name} size={30} tone="brand" />
                  <div className="flex min-w-0 flex-1 flex-col gap-1">
                    <span className="truncate text-[13.5px] font-semibold text-[var(--sand-50)]">
                      {member.name}
                    </span>
                    <span className="h-1.5 overflow-hidden rounded-pill bg-white/15">
                      {/* Fill is data-driven. */}
                      <span
                        className="block h-full rounded-pill bg-[var(--green-300)]"
                        style={{ width: `${pct}%` }}
                      />
                    </span>
                  </div>
                  <div className="shrink-0 text-end">
                    <div className="font-mono text-[13px] font-bold text-[var(--sand-50)]">
                      {member.load}
                    </div>
                    <div className="font-mono text-[11.5px] text-[var(--green-300)]">
                      {member.closed} closed
                    </div>
                  </div>
                </div>
              );
            })}
          </Panel>
        </div>

      </div>
    </>
  );
}
