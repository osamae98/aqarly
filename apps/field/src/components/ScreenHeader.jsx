import Link from "next/link";
import Icon from "@aqarly/ui/Icon";

// Every screen below the worklist opens with the same bar: the way back, the
// job's reference, and the screen's own title under it.
export default function ScreenHeader({ backHref, eyebrow, title, action }) {
  return (
    <header className="sticky top-0 z-10 flex items-start gap-3 border-b border-border bg-surface px-4 py-3.5">
      {backHref && (
        <Link
          href={backHref}
          aria-label="Back"
          className="-ms-2 flex size-11 shrink-0 items-center justify-center rounded-pill text-ink"
        >
          <Icon name="chevron-right" size={22} className="rotate-180" />
        </Link>
      )}

      <div className="flex min-w-0 flex-1 flex-col gap-0.5 py-0.5">
        {eyebrow && (
          <p className="font-mono text-[11px] font-bold tracking-[0.09em] text-ink-muted uppercase">
            {eyebrow}
          </p>
        )}
        <h1 className="line-clamp-2 text-lg leading-snug font-bold tracking-[-0.01em] text-ink">
          {title}
        </h1>
      </div>

      {action}
    </header>
  );
}
