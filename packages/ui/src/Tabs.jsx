import Link from "next/link";
import Icon from "./Icon";

// Ported from `components/navigation/Tabs.jsx`. Tabs carrying an `href` render
// as links so a tabbed page can keep its state in the URL — the design
// system's `onChange` form still works for client-side switching.
export default function Tabs({
  tabs = [],
  value,
  onChange,
  variant = "underline",
  fullWidth = false,
  className = "",
}) {
  const pill = variant === "pill";

  return (
    <div
      role="tablist"
      className={[
        "flex font-sans",
        pill
          ? "gap-2 rounded-pill bg-sunken p-1"
          : "gap-5 border-b border-border",
        className,
      ].join(" ")}
    >
      {tabs.map((tab) => {
        const item = typeof tab === "string" ? { value: tab, label: tab } : tab;
        const active = item.value === value;

        const classes = [
          "inline-flex items-center justify-center gap-2 text-sm transition-colors",
          fullWidth ? "flex-1" : "flex-none",
          pill
            ? "min-h-9 rounded-pill px-4 py-2"
            : "-mb-px min-h-11 border-b-2 py-3",
          pill
            ? active
              ? "bg-surface text-ink shadow-sm"
              : "text-ink-soft hover:text-ink"
            : active
              ? "border-brand text-brand"
              : "border-transparent text-ink-soft hover:text-ink",
          active ? "font-semibold" : "font-medium",
        ].join(" ");

        const inner = (
          <>
            {item.icon && <Icon name={item.icon} size={16} />}
            {item.label}
            {item.count != null && (
              <span
                className={[
                  "rounded-pill px-[7px] py-px text-xs font-semibold",
                  active
                    ? "bg-brand-tint text-brand"
                    : "bg-sunken text-ink-muted",
                ].join(" ")}
              >
                {item.count}
              </span>
            )}
          </>
        );

        return item.href ? (
          <Link
            key={item.value}
            href={item.href}
            role="tab"
            aria-selected={active}
            className={classes}
          >
            {inner}
          </Link>
        ) : (
          <button
            key={item.value}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onChange?.(item.value)}
            className={`${classes} cursor-pointer`}
          >
            {inner}
          </button>
        );
      })}
    </div>
  );
}
