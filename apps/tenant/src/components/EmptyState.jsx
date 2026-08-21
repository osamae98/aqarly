const tones = {
  brand: "bg-brand-tint text-brand",
  success: "bg-success-tint text-success",
  neutral: "bg-sunken text-ink-soft",
};

export default function EmptyState({
  icon,
  tone = "brand",
  title,
  description,
  action,
}) {
  return (
    <div className="px-6 py-12 text-center">
      <div
        className={`mx-auto mb-5 flex size-18 items-center justify-center rounded-pill ${tones[tone] ?? tones.brand}`}
      >
        {icon}
      </div>
      <h2 className="mb-2 text-lg font-semibold text-ink">{title}</h2>
      <p className="mb-6 text-sm text-ink-soft">{description}</p>
      {action}
    </div>
  );
}
