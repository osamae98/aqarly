const tones = {
  neutral: "bg-sunken text-ink-soft",
  brand: "bg-brand-tint text-brand",
  info: "bg-stage-assigned-tint text-stage-assigned",
  warning: "bg-stage-in-progress-tint text-stage-in-progress",
  success: "bg-stage-done-tint text-stage-done",
  danger: "bg-stage-overdue-tint text-stage-overdue",
  maintenance: "bg-category-maintenance-tint text-category-maintenance",
  housekeeping: "bg-category-housekeeping-tint text-category-housekeeping",
};

export default function Badge({ tone = "neutral", className = "", children }) {
  return (
    <span
      className={[
        "inline-flex items-center gap-1.5 whitespace-nowrap rounded-pill",
        "px-2.5 py-[3px] text-xs font-semibold tracking-[0.01em]",
        tones[tone] ?? tones.neutral,
        className,
      ].join(" ")}
    >
      <span className="size-1.5 shrink-0 rounded-pill bg-current" />
      {children}
    </span>
  );
}
