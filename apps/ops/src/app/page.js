import Link from "next/link";
import Badge from "@aqarly/ui/Badge";
import Button from "@aqarly/ui/Button";
import CostTrend from "@/components/CostTrend";
import StatTile from "@/components/StatTile";
import {
  formatAge,
  getDashboardStats,
  slaLabels,
  slaTones,
  stageLabels,
} from "@aqarly/core/operations";

export default async function OpsDashboardPage() {
  const stats = await getDashboardStats();
  const totalByStage = stats.byStage.reduce((sum, s) => sum + s.count, 0);

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-ink">
            Portfolio dashboard
          </h1>
          <p className="mt-1 text-sm text-ink-soft">
            Maintenance and housekeeping across all properties.
          </p>
        </div>
        <Button href="/requests" size="sm">
          Open the queue
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatTile label="Open requests" value={stats.open} />
        <StatTile
          label="Unassigned"
          value={stats.unassigned}
          tone={stats.unassigned > 0 ? "warning" : "neutral"}
          hint="Awaiting triage"
        />
        <StatTile
          label="Overdue"
          value={stats.overdue}
          tone={stats.overdue > 0 ? "danger" : "success"}
          hint="Past SLA target"
        />
        <StatTile label="In progress" value={stats.inProgress} hint="Field work underway" />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <section className="lg:col-span-2">
          <h2 className="mb-3 text-md font-semibold text-ink">Needs attention</h2>
          {stats.needsAttention.length ? (
            <ul className="overflow-hidden rounded-lg border border-border bg-surface shadow-sm">
              {stats.needsAttention.map((request) => (
                <li key={request.id} className="border-b border-border last:border-b-0">
                  <Link
                    href={`/requests/${request.id}`}
                    className="flex items-center justify-between gap-4 p-4 transition-colors hover:bg-sunken"
                  >
                    <div className="min-w-0">
                      <div className="truncate font-medium text-ink">
                        {request.summary}
                      </div>
                      <div className="mt-1 text-xs text-ink-muted">
                        {request.property?.name} · Unit {request.unit?.label} ·{" "}
                        {request.assignee?.name ?? "Unassigned"}
                      </div>
                    </div>
                    <div className="flex shrink-0 items-center gap-2">
                      <span className="text-xs text-ink-muted">
                        {formatAge(request.ageHours)}
                      </span>
                      <Badge tone={slaTones[request.sla.state]}>
                        {slaLabels[request.sla.state]}
                      </Badge>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <div className="rounded-lg border border-border bg-surface p-8 text-center text-sm text-ink-soft">
              Nothing overdue or at risk.
            </div>
          )}
        </section>

        <section className="flex flex-col gap-6">
          <div className="rounded-lg border border-border bg-surface p-6 shadow-sm">
            <h2 className="text-md font-semibold text-ink">SLA adherence</h2>
            <p className="mt-2 text-3xl font-semibold text-ink">
              {stats.slaAdherence === null
                ? "—"
                : `${Math.round(stats.slaAdherence * 100)}%`}
            </p>
            <p className="mt-1 text-xs text-ink-muted">
              Of completed requests, resolved within target
            </p>
            <p className="mt-4 text-sm text-ink-soft">
              Median resolution{" "}
              <span className="font-medium text-ink">
                {stats.medianResolutionHours === null
                  ? "—"
                  : formatAge(stats.medianResolutionHours)}
              </span>
            </p>
          </div>

          <div className="rounded-lg border border-border bg-surface p-6 shadow-sm">
            <h2 className="mb-4 text-md font-semibold text-ink">By stage</h2>
            <ul className="flex flex-col gap-3">
              {stats.byStage.map(({ stage, count }) => (
                <li key={stage}>
                  <Link
                    href={`/requests?stage=${stage}`}
                    className="flex items-center justify-between text-sm transition-colors hover:text-brand"
                  >
                    <span className="text-ink-soft">{stageLabels[stage]}</span>
                    <span className="font-medium text-ink">{count}</span>
                  </Link>
                  <div className="mt-1.5 h-1.5 overflow-hidden rounded-pill bg-sunken">
                    {/* Proportional to the stage split, so width is data-driven. */}
                    <div
                      className="h-full rounded-pill bg-brand"
                      style={{
                        width: `${totalByStage ? (count / totalByStage) * 100 : 0}%`,
                      }}
                    />
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </section>
      </div>

      <section className="rounded-lg border border-border bg-surface p-6 shadow-sm">
        <h2 className="mb-1 text-md font-semibold text-ink">Housekeeping charges</h2>
        <p className="mb-5 text-xs text-ink-muted">
          Billed on completed visits, by month
        </p>
        <CostTrend data={stats.costTrend} />
      </section>
    </div>
  );
}
