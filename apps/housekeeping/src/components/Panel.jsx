// The content card the mockups use throughout: white, 12px corner, hairline
// border, no shadow — distinct from the design system's `Card`, which is the
// heavier surface the marketing site is built from.
export default function Panel({
  label,
  title,
  caption,
  action,
  tone = "surface",
  className = "",
  bodyClassName = "",
  children,
}) {
  return (
    <section
      className={[
        "rounded-md border p-5",
        tone === "brand"
          ? "border-[var(--green-800)] bg-[var(--green-700)]"
          : "border-border bg-surface",
        className,
      ].join(" ")}
    >
      {(label || title || action) && (
        <header className="mb-4 flex items-start gap-4">
          <div className="min-w-0 flex-1">
            {label && <MicroLabel tone={tone}>{label}</MicroLabel>}
            {title && (
              <h2
                className={[
                  "text-base font-bold",
                  tone === "brand" ? "text-[var(--sand-50)]" : "text-ink",
                ].join(" ")}
              >
                {title}
              </h2>
            )}
            {caption && (
              <p
                className={[
                  "mt-0.5 text-[12.5px]",
                  tone === "brand"
                    ? "text-[var(--green-300)]"
                    : "text-ink-muted",
                ].join(" ")}
              >
                {caption}
              </p>
            )}
          </div>
          {action}
        </header>
      )}
      <div className={bodyClassName}>{children}</div>
    </section>
  );
}

export function MicroLabel({ tone = "surface", className = "", children }) {
  return (
    <div
      className={[
        "text-[11.5px] font-bold tracking-[0.12em] uppercase",
        tone === "brand" ? "text-[var(--green-300)]" : "text-ink-muted",
        className,
      ].join(" ")}
    >
      {children}
    </div>
  );
}
