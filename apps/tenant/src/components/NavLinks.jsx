"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { History, Home, User } from "./icons";

// The portal's three top-level destinations. Rendered as a bottom bar on
// phones and as inline header links once there is room for them.
const tabs = [
  { href: "/", label: "Home", Icon: Home },
  { href: "/history", label: "History", Icon: History },
  { href: "/profile", label: "Profile", Icon: User },
];

function useIsActive() {
  const pathname = usePathname();
  return (href) => (href === "/" ? pathname === "/" : pathname.startsWith(href));
}

export function BottomNav() {
  const isActive = useIsActive();

  return (
    <nav
      aria-label="Main"
      className="fixed inset-x-0 bottom-0 z-20 mx-auto flex h-14 w-full max-w-md items-center border-t border-border bg-surface md:hidden"
    >
      {tabs.map(({ href, label, Icon }) => (
        <Link
          key={href}
          href={href}
          aria-current={isActive(href) ? "page" : undefined}
          className={[
            "flex flex-1 flex-col items-center gap-1 text-xs transition-colors",
            isActive(href) ? "text-brand" : "text-ink-soft hover:text-ink",
          ].join(" ")}
        >
          <Icon size={20} />
          {label}
        </Link>
      ))}
    </nav>
  );
}

export function HeaderNav() {
  const isActive = useIsActive();

  return (
    <nav aria-label="Main" className="hidden items-center gap-1 md:flex">
      {tabs.map(({ href, label }) => (
        <Link
          key={href}
          href={href}
          aria-current={isActive(href) ? "page" : undefined}
          className={[
            "rounded-pill px-3 py-1.5 text-sm transition-colors",
            isActive(href)
              ? "bg-brand-tint font-medium text-brand"
              : "text-ink-soft hover:bg-sunken hover:text-ink",
          ].join(" ")}
        >
          {label}
        </Link>
      ))}
    </nav>
  );
}
