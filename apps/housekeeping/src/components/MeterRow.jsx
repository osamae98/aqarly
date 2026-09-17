// Label on the left, monospaced figure on the right, a track underneath —
// the bar the mockups use for every category and building breakdown.
export default function MeterRow({ label, value, pct, tone = "brand" }) {
  const fills = {
    brand: "bg-brand",
    warning: "bg-warning",
    danger: "bg-danger",
    success: "bg-success",
  };

  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex justify-between gap-3 text-[13.5px]">
        <span className="font-semibold text-ink">{label}</span>
        <span className="font-mono font-bold text-ink">{value}</span>
      </div>
      <div className="h-2.5 overflow-hidden rounded-pill bg-sunken">
        {/* Bar length is data-driven, so width has to be an inline style. */}
        <div
          className={`h-full rounded-pill ${fills[tone] ?? fills.brand}`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
