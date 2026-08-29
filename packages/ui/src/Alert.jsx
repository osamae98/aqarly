const tones = {
  info: "border-info bg-info-tint text-info-ink",
  success: "border-success bg-success-tint text-success-ink",
  warning: "border-warning bg-warning-tint text-warning-ink",
  error: "border-danger bg-danger-tint text-danger-ink",
};

export default function Alert({
  tone = "info",
  title,
  dismissible = false,
  onDismiss,
  className = "",
  children,
}) {
  return (
    <div
      role="status"
      className={[
        "flex items-start gap-3 rounded-md border-l-4 p-4",
        tones[tone] ?? tones.info,
        className,
      ].join(" ")}
    >
      <div className="flex-1">
        {title && <div className="mb-2 font-semibold">{title}</div>}
        <div className="text-sm">{children}</div>
      </div>
      {dismissible && (
        <button
          type="button"
          aria-label="Dismiss"
          onClick={onDismiss}
          className="shrink-0 cursor-pointer text-md leading-none text-current"
        >
          ×
        </button>
      )}
    </div>
  );
}
