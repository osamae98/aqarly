import { MicroLabel } from "@/components/Panel";

const tones = {
  neutral: "text-ink",
  brand: "text-brand",
  warning: "text-warning",
  danger: "text-danger",
  success: "text-success",
};

// The KPI card: micro label, a big monospaced figure, one line of context.
export default function Stat({ label, value, hint, tone = "neutral" }) {
  return (
    <div className="flex flex-col gap-1.5 rounded-md border border-border bg-surface px-5 py-4">
      <MicroLabel>{label}</MicroLabel>
      <div
        className={`font-mono text-[32px] leading-none font-bold tracking-[-0.02em] ${
          tones[tone] ?? tones.neutral
        }`}
      >
        {value}
      </div>
      {hint && <div className="text-[12.5px] text-ink-muted">{hint}</div>}
    </div>
  );
}
