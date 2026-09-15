import Link from "next/link";
import Badge from "@aqarly/ui/Badge";
import Icon from "@aqarly/ui/Icon";
import { MicroLabel } from "@/components/Panel";
import { formatCharge } from "@aqarly/core/operations";

// One building as a card. On the portfolio grid it is only a way in — name,
// area, and how much is open. `detail` is the single-building version that
// heads a scoped Buildings screen and carries the numbers.
export default function BuildingCard({ building, detail = false }) {
  const header = (
    <header className="flex items-center gap-4">
      <span className="flex size-14 shrink-0 items-center justify-center rounded-md bg-brand-tint text-brand">
        <Icon name="building" size={28} />
      </span>
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <h2 className="text-xl leading-tight font-bold text-ink">{building.name}</h2>
        <p className="flex items-center gap-1.5 text-sm text-ink-muted">
          <Icon name="map-pin" size={15} />
          {building.address}
        </p>
      </div>
    </header>
  );

  if (!detail) {
    return (
      <Link
        href={`/units?propertyId=${building.id}`}
        className="group flex min-h-36 flex-col gap-4 rounded-lg border border-border bg-surface p-6 shadow-sm transition-[border-color,box-shadow] hover:border-brand hover:shadow-md"
      >
        <div className="flex items-center gap-3.5">
          <span className="flex size-12 shrink-0 items-center justify-center rounded-lg bg-sunken text-ink-soft transition-colors group-hover:bg-brand-tint group-hover:text-brand">
            <Icon name="building" size={22} />
          </span>
          <h2 className="min-w-0 flex-1 text-base leading-tight font-bold text-ink">
            {building.name}
          </h2>
          {/* The one number worth seeing before opening a building. */}
          {building.open > 0 && (
            <Badge tone="info" dot={false}>
              {building.open} open
            </Badge>
          )}
        </div>
        <p className="flex items-center gap-1.5 text-[13px] text-ink-muted">
          <Icon name="map-pin" size={14} />
          {building.address}
        </p>
      </Link>
    );
  }

  // The four figures worth a full tile; spend-per-unit and lifetime request
  // count are real but secondary, so they read as a caption rather than
  // competing with these at the same size.
  const facts = [
    { label: "Units", value: building.units },
    {
      label: "Open requests",
      value: building.open,
      tone: building.open > 0 ? "text-ink" : "text-ink-muted",
    },
    {
      label: "Unassigned",
      value: building.unassigned,
      tone: building.unassigned > 0 ? "text-danger" : "text-ink-muted",
    },
    { label: "Lifetime spend", value: formatCharge(building.spend) },
  ];

  return (
    <section className="flex flex-col gap-4 rounded-md border border-border bg-surface p-5">
      {header}

      <dl className="grid grid-cols-2 gap-3 border-t border-border pt-4 sm:grid-cols-4">
        {facts.map((fact) => (
          <div key={fact.label} className="flex min-w-0 flex-col gap-1">
            <dt>
              <MicroLabel>{fact.label}</MicroLabel>
            </dt>
            <dd
              className={`truncate font-mono text-[17px] font-bold ${fact.tone ?? "text-ink"}`}
            >
              {fact.value}
            </dd>
          </div>
        ))}
      </dl>

      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border pt-4">
        <p className="text-[12.5px] text-ink-muted">
          {formatCharge(Math.round(building.spendPerUnit))} per unit ·{" "}
          {building.requests} {building.requests === 1 ? "request" : "requests"} on
          record
        </p>
        <Link
          href={`/requests?propertyId=${building.id}`}
          className="rounded-pill border border-border-strong px-4 py-2 text-[13.5px] font-semibold text-ink transition-colors hover:border-brand hover:text-brand"
        >
          View requests
        </Link>
      </div>
    </section>
  );
}
