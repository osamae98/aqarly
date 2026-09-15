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

// A unit tile under a building's card — the same facts the old table row
// carried, laid out to be scanned as a grid.
export default function UnitCard({ unit }) {
  return (
    <Link
      href={`/units/${unit.id}`}
      className="flex flex-col gap-3 rounded-md border border-border bg-surface p-4 transition-colors hover:border-brand"
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <div className="font-mono text-[17px] font-bold text-ink">
            {unit.label}
          </div>
          <div className="text-[12px] text-ink-muted">
            {unit.bedrooms} BR · {unit.bathrooms} bath
          </div>
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

      <dl className="mt-auto grid grid-cols-[2.5rem_minmax(0,1fr)_auto] gap-2 border-t border-border pt-3 text-[11px] text-ink-muted">
        <div>
          <dt>Open</dt>
          <dd
            className={[
              "font-mono text-[13px]",
              unit.openCount > 0 ? "font-bold text-ink" : "text-ink-muted",
            ].join(" ")}
          >
            {unit.openCount || "—"}
          </dd>
        </div>
        <div>
          <dt>Lifetime</dt>
          <dd className="font-mono text-[13px] text-ink-soft">
            {formatCharge(unit.lifetimeSpend)}
          </dd>
        </div>
        <div>
          <dt>Serviced</dt>
          <dd className="whitespace-nowrap font-mono text-[12px] text-ink-soft">
            {unit.lastServicedAt ? formatDate(unit.lastServicedAt) : "—"}
          </dd>
        </div>
      </dl>
    </Link>
  );
}
