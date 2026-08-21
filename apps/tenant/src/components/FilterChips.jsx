import Link from "next/link";

// Filters live in the URL rather than in client state, so the screens that
// use them stay server components (see the ops portal's QueueFilters).
export default function FilterChips({ basePath, name, options, active }) {
  return (
    <div className="flex gap-2 overflow-x-auto">
      {options.map((option) => {
        const isActive = (active ?? null) === option.value;
        const href = option.value
          ? `${basePath}?${new URLSearchParams({ [name]: option.value })}`
          : basePath;

        return (
          <Link
            key={option.label}
            href={href}
            aria-current={isActive ? "true" : undefined}
            className={[
              "whitespace-nowrap rounded-pill px-3 py-1 text-xs font-semibold transition-colors",
              isActive
                ? "bg-brand text-ink-inverse"
                : "border border-border bg-surface text-ink hover:bg-sunken",
            ].join(" ")}
          >
            {option.label}
          </Link>
        );
      })}
    </div>
  );
}
