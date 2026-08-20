import { formatCharge } from "@aqarly/core/operations";

const monthLabel = (month) =>
  new Intl.DateTimeFormat("en", { month: "short", year: "numeric", timeZone: "UTC" })
    .format(new Date(`${month}-01T00:00:00Z`));

export default function CostTrend({ data }) {
  if (!data.length) {
    return <p className="text-sm text-ink-muted">No charges recorded yet.</p>;
  }

  const max = Math.max(...data.map((d) => d.total));

  return (
    <div className="flex flex-col gap-3">
      {data.map(({ month, total }) => (
        <div key={month} className="flex items-center gap-3">
          <div className="w-20 shrink-0 text-xs text-ink-soft">
            {monthLabel(month)}
          </div>
          <div className="h-2 flex-1 overflow-hidden rounded-pill bg-sunken">
            {/* Bar length is data-driven, so it has to be an inline width. */}
            <div
              className="h-full rounded-pill bg-brand"
              style={{ width: `${(total / max) * 100}%` }}
            />
          </div>
          <div className="w-24 shrink-0 text-right text-sm font-medium text-ink">
            {formatCharge(total)}
          </div>
        </div>
      ))}
    </div>
  );
}
