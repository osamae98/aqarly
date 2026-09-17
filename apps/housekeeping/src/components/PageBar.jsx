// The white band every ops screen opens with: what you are looking at on the
// left, the actions for that screen on the right.
export default function PageBar({ eyebrow, title, meta, children, stats }) {
  return (
    <div className="flex flex-wrap items-start gap-4 border-b border-border bg-surface px-4 py-4 md:px-6">
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        {eyebrow && <div className="text-[12.5px] text-ink-muted">{eyebrow}</div>}
        <h1 className="text-[22px] leading-tight font-bold tracking-[-0.01em] text-ink">
          {title}
        </h1>
        {meta && <div className="text-[12.5px] text-ink-muted">{meta}</div>}
      </div>
      {stats}
      {children && (
        <div className="flex flex-wrap items-center gap-2">{children}</div>
      )}
    </div>
  );
}
