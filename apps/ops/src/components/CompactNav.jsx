"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import Icon from "@aqarly/ui/Icon";

const items = [
  { href: "/requests", label: "Requests", icon: "file-text" },
  { href: "/units", label: "Units", icon: "building" },
  { href: "/staff", label: "Staff", icon: "users" },
  { href: "/", label: "Reports", icon: "sliders" },
  { href: "/rates", label: "Rates", icon: "receipt" },
];

// Stands in for the rail below its breakpoint — the building scope stays a
// queue filter there rather than becoming a second nav.
export default function CompactNav({ openCount }) {
  const pathname = usePathname();

  return (
    <header className="flex shrink-0 items-center gap-2 bg-[var(--green-700)] px-3 py-2 md:hidden">
      <span className="flex size-7 items-center justify-center rounded-sm bg-[var(--green-400)] text-sm font-bold text-[var(--green-900)]">
        A
      </span>
      <nav className="flex flex-1 items-center justify-end gap-1">
        {items.map((item) => {
          const active =
            item.href === "/"
              ? pathname === "/"
              : pathname.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              aria-label={item.label}
              aria-current={active ? "page" : undefined}
              className={[
                "relative flex size-9 items-center justify-center rounded-sm transition-colors",
                active
                  ? "bg-white/10 text-[var(--sand-50)]"
                  : "text-[var(--green-200)] hover:bg-white/[0.07]",
              ].join(" ")}
            >
              <Icon name={item.icon} size={18} />
              {item.href === "/requests" && openCount > 0 && (
                <span className="absolute -top-0.5 -end-0.5 rounded-pill bg-danger px-1.5 font-mono text-[10px] font-bold text-ink-inverse">
                  {openCount}
                </span>
              )}
            </Link>
          );
        })}
      </nav>
    </header>
  );
}
