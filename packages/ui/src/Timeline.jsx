// Domain-free vertical timeline. Callers pass steps already resolved to a
// state, so the design system stays unaware of what is being tracked.
export default function Timeline({ steps }) {
  return (
    <ol className="flex flex-col">
      {steps.map((step, index) => {
        const isLast = index === steps.length - 1;
        const reached = step.state === "done" || step.state === "current";

        return (
          <li key={step.label} className="flex gap-3">
            <div className="flex flex-col items-center">
              <span
                className={[
                  "size-3 shrink-0 rounded-pill border-2",
                  reached
                    ? "border-brand bg-brand"
                    : "border-border-strong bg-surface",
                ].join(" ")}
              />
              {!isLast && (
                <span
                  className={[
                    "w-0.5 flex-1",
                    step.state === "done" ? "bg-brand" : "bg-border",
                  ].join(" ")}
                />
              )}
            </div>
            <div className={isLast ? "" : "pb-6"}>
              <div
                className={[
                  "text-sm",
                  step.state === "current"
                    ? "font-semibold text-ink"
                    : "text-ink-soft",
                ].join(" ")}
              >
                {step.label}
              </div>
              {step.caption && (
                <div className="text-xs text-ink-muted">{step.caption}</div>
              )}
            </div>
          </li>
        );
      })}
    </ol>
  );
}
