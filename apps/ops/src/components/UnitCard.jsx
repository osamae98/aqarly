import Link from "next/link";
import Badge from "@aqarly/ui/Badge";
import {
  categoryLabels,
  formatCharge,
  formatDate,
} from "@aqarly/core/operations";

const statusTones = {
  occupied: "success",
  vacant: "neutral",
  "under-maintenance": "warning",
};

const statusLabels = {
  occupied: "Occupied",
  vacant: "Vacant",
  "under-maintenance": "Maintenance",
};

// A unit tile under a building's card. A unit with no history yet has
// nothing true to say about open work, spend, or service — so the history
// line only appears once there is one, rather than three dashes on every
// quiet unit in the building.
export default function UnitCard({ unit }) {
  const hasHistory = unit.openCount > 0 || unit.lifetimeSpend > 0 || unit.lastServicedAt;

  return (
    <Link
      href={`/units/${unit.id}`}
      className="flex flex-col gap-2.5 rounded-md border border-border bg-surface p-4 transition-colors hover:border-brand"
    >
      <div className="flex items-center justify-between gap-2">
        <div className="flex min-w-0 items-baseline gap-2">
          <span className="font-mono text-[15px] font-bold text-ink">
            {unit.label}
          </span>
          <span className="truncate text-[12px] text-ink-muted">
            {unit.bedrooms} BR · {unit.bathrooms} bath
          </span>
        </div>
        <Badge tone={statusTones[unit.status] ?? "neutral"} dot={false}>
          {statusLabels[unit.status] ?? unit.status}
        </Badge>
      </div>

      <div className="truncate text-[13.5px] text-ink">
        {unit.tenant?.name ?? <span className="text-ink-muted">No tenant</span>}
      </div>

      {unit.repeatFault && (
        <div className="rounded-sm bg-warning-tint px-2.5 py-1.5 text-[12px] font-semibold text-warning-ink">
          Repeat fault ·{" "}
          {categoryLabels[unit.repeatFault.category] ?? unit.repeatFault.category}
        </div>
      )}

      {hasHistory && (
        <div className="flex items-center gap-3 border-t border-border pt-2.5 font-mono text-[11.5px] text-ink-soft">
          {unit.openCount > 0 && (
            <span className="font-bold text-ink">{unit.openCount} open</span>
          )}
          {unit.lifetimeSpend > 0 && <span>{formatCharge(unit.lifetimeSpend)}</span>}
          {unit.lastServicedAt && (
            <span className="truncate">Serviced {formatDate(unit.lastServicedAt)}</span>
          )}
        </div>
      )}
    </Link>
  );
}
