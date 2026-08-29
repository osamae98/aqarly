"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import Badge from "@aqarly/ui/Badge";
import { formatCharge, formatDate } from "@aqarly/core/operations";

const GRID =
  "grid grid-cols-[80px_minmax(0,1fr)_150px_150px_56px_104px_112px] items-center gap-3.5";

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

export default function UnitRows({ units }) {
  const router = useRouter();

  return (
    <div className="min-w-[60rem]">
      <div className={`${GRID} pb-2.5 text-[11px] font-bold tracking-[0.1em] uppercase text-ink-muted`}>
        <span>Unit</span>
        <span>Tenant</span>
        <span>Building</span>
        <span>Status · size</span>
        <span className="text-end">Open</span>
        <span className="text-end">Lifetime</span>
        <span>Last serviced</span>
      </div>

      {units.length === 0 && (
        <p className="border-t border-border py-16 text-center text-sm text-ink-muted">
          No units in this scope.
        </p>
      )}

      {units.map((unit) => (
        <div
          key={unit.id}
          onClick={() => router.push(`/units/${unit.id}`)}
          className={`${GRID} min-h-14 cursor-pointer border-t border-border transition-colors hover:bg-surface`}
        >
          <span>
            <Link
              href={`/units/${unit.id}`}
              onClick={(event) => event.stopPropagation()}
              className="font-mono text-[13.5px] font-semibold text-ink hover:text-brand"
            >
              {unit.label}
            </Link>
          </span>
          <span className="min-w-0 truncate text-[13.5px] text-ink">
            {unit.tenant?.name ?? <span className="text-ink-muted">—</span>}
          </span>
          <span className="min-w-0 truncate text-[13px] text-ink-soft">
            {unit.property?.name ?? "—"}
          </span>
          <span className="flex min-w-0 items-center gap-2">
            <Badge tone={statusTones[unit.status] ?? "neutral"} dot={false}>
              {statusLabels[unit.status] ?? unit.status}
            </Badge>
            <span className="truncate text-[11.5px] text-ink-muted">
              {unit.bedrooms} BR
            </span>
          </span>
          <span
            className={[
              "text-end font-mono text-[13px]",
              unit.openCount > 0 ? "font-bold text-ink" : "text-ink-muted",
            ].join(" ")}
          >
            {unit.openCount || "—"}
          </span>
          <span className="text-end font-mono text-[13px] text-ink-soft">
            {formatCharge(unit.lifetimeSpend)}
          </span>
          <span className="font-mono text-[12.5px] text-ink-muted">
            {unit.lastServicedAt ? formatDate(unit.lastServicedAt) : "—"}
          </span>
        </div>
      ))}
    </div>
  );
}
