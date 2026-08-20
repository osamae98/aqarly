export default function Card({
  title,
  description,
  footer,
  actionButtons,
  className = "",
  children,
}) {
  return (
    <div
      className={[
        "rounded-lg border border-border bg-surface p-6 shadow-sm transition-shadow",
        className,
      ].join(" ")}
    >
      {(title || description) && (
        <div className="mb-4">
          {title && (
            <h3 className="mb-2 text-lg font-semibold text-ink">{title}</h3>
          )}
          {description && <p className="text-sm text-ink-soft">{description}</p>}
        </div>
      )}
      {children}
      {(footer || actionButtons) && (
        <div className="mt-6 flex justify-end gap-3 border-t border-border pt-6">
          {actionButtons || footer}
        </div>
      )}
    </div>
  );
}
