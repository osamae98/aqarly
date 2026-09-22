// The three numbers the worklist opens with. Each is a count of work, not a
// reading off a clock: how much is left, how much of that is an emergency,
// and how much has been closed. Nothing here is a duration, a target, or a
// percentage against one.
function Tile({ value, label, tone = "neutral" }) {
  const tones = {
    neutral: "border-border bg-surface text-ink",
    urgent: "border-[var(--red-300)] bg-danger-tint text-danger-ink",
  };

  return (
    <div
      className={`flex flex-1 flex-col gap-0.5 rounded-md border px-3.5 py-3 ${tones[tone] ?? tones.neutral}`}
    >
      <span className="font-mono text-2xl leading-none font-bold">{value}</span>
      <span className="text-xs font-medium text-current opacity-70">{label}</span>
    </div>
  );
}

export default function StatTiles({ counts }) {
  return (
    <div className="flex gap-2.5">
      <Tile value={counts.left} label="jobs left" />
      <Tile
        value={counts.urgent}
        label="urgent"
        tone={counts.urgent > 0 ? "urgent" : "neutral"}
      />
      <Tile value={counts.closed} label="closed" />
    </div>
  );
}
