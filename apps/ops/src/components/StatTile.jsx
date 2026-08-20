const tones = {
  neutral: "text-ink",
  brand: "text-brand",
  warning: "text-warning",
  danger: "text-danger",
  success: "text-success",
};

export default function StatTile({ label, value, hint, tone = "neutral" }) {
  return (
    <div className="rounded-lg border border-border bg-surface p-6 shadow-sm">
      <div className="text-sm text-ink-soft">{label}</div>
      <div className={`mt-2 text-3xl font-semibold ${tones[tone] ?? tones.neutral}`}>
        {value}
      </div>
      {hint && <div className="mt-1 text-xs text-ink-muted">{hint}</div>}
    </div>
  );
}
