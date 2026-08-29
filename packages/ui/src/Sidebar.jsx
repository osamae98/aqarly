import Link from "next/link";
import Icon from "./Icon";

// Ported from the design system's `components/navigation/Sidebar.jsx`, with
// three additions the ops chrome needs, all supersets of the documented API:
// `tone="brand"` for the dark rail the portal is drawn with, `children` for
// domain content below the nav (the building scope tree), and `href` on an
// item so an app-router shell renders real links rather than routing
// imperatively.
const chrome = {
  surface: {
    aside: "border-e border-border bg-surface",
    header: "border-b border-border",
    label: "text-ink-muted",
    idle: "text-ink-soft hover:bg-sunken",
    active: "bg-brand-tint font-semibold text-brand",
    rail: "bg-brand",
    footer: "border-t border-border",
    countIdle: "bg-sunken text-ink-muted",
    countActive: "bg-brand-tint-strong text-brand",
  },
  brand: {
    aside: "border-e border-[var(--green-800)] bg-[var(--green-700)]",
    header: "border-b border-white/10",
    label: "text-[var(--green-300)]",
    idle: "text-[var(--green-200)] hover:bg-white/[0.07]",
    active: "bg-white/10 font-semibold text-[var(--sand-50)]",
    rail: "bg-[var(--green-300)]",
    footer: "border-t border-white/10",
    countIdle: "bg-white/10 text-[var(--green-200)]",
    countActive: "bg-white/15 text-[var(--sand-50)]",
  },
};

function Item({ item, active, collapsed, onNavigate, skin }) {
  const classes = [
    "relative flex min-h-10 items-center gap-2.5 rounded-sm text-sm transition-colors",
    collapsed ? "justify-center px-0" : "justify-start px-3",
    active ? skin.active : `font-medium ${skin.idle}`,
  ].join(" ");

  const inner = (
    <>
      {active && !collapsed && (
        <span
          className={`absolute inset-y-2 start-0 w-[3px] rounded-pill ${skin.rail}`}
        />
      )}
      {item.icon && <Icon name={item.icon} size={18} />}
      {!collapsed && (
        <span className="min-w-0 flex-1 truncate text-start">{item.label}</span>
      )}
      {!collapsed && item.count != null && (
        <span
          className={[
            "rounded-pill px-[7px] py-px text-xs font-semibold",
            item.countTone === "danger"
              ? "bg-danger text-ink-inverse"
              : active
                ? skin.countActive
                : skin.countIdle,
          ].join(" ")}
        >
          {item.count}
        </span>
      )}
    </>
  );

  if (item.href) {
    return (
      <Link
        href={item.href}
        title={collapsed ? item.label : undefined}
        aria-current={active ? "page" : undefined}
        className={classes}
      >
        {inner}
      </Link>
    );
  }

  return (
    <button
      type="button"
      onClick={() => onNavigate?.(item.value)}
      title={collapsed ? item.label : undefined}
      className={`${classes} cursor-pointer border-none text-start`}
    >
      {inner}
    </button>
  );
}

export default function Sidebar({
  brand,
  sections = [],
  activeItem,
  onNavigate,
  collapsed = false,
  tone = "surface",
  footer,
  className = "",
  children,
}) {
  const skin = chrome[tone] ?? chrome.surface;

  return (
    <aside
      className={[
        "flex h-full shrink-0 flex-col font-sans",
        skin.aside,
        collapsed
          ? "w-[var(--sidebar-width-collapsed)]"
          : "w-[var(--sidebar-width)]",
        className,
      ].join(" ")}
    >
      {brand && (
        <div
          className={`flex h-[var(--topbar-height)] items-center overflow-hidden px-4 ${skin.header}`}
        >
          {brand}
        </div>
      )}

      <nav className="flex min-h-0 flex-1 flex-col overflow-y-auto p-3">
        {sections.map((section, index) => (
          <div key={section.label ?? index} className="mb-4">
            {section.label && !collapsed && (
              <div
                className={`px-3 pb-2 text-xs font-semibold tracking-[0.1em] uppercase ${skin.label}`}
              >
                {section.label}
              </div>
            )}
            <div className="grid gap-0.5">
              {section.items.map((item) => (
                <Item
                  key={item.value}
                  item={item}
                  active={item.value === activeItem}
                  collapsed={collapsed}
                  onNavigate={onNavigate}
                  skin={skin}
                />
              ))}
            </div>
          </div>
        ))}
        {!collapsed && children}
      </nav>

      {footer && <div className={`p-3 ${skin.footer}`}>{footer}</div>}
    </aside>
  );
}
