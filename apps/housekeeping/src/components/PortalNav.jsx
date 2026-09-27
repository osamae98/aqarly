"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import Icon from "@aqarly/ui/Icon";
import Sidebar from "@aqarly/ui/Sidebar";
import { signOutAction } from "@/app/actions";
import OpsMark from "@/components/OpsMark";

// Remembered across visits — a rail an admin collapsed yesterday should stay
// collapsed, the same way a window's size does.
const STORAGE_KEY = "aqarly-housekeeping-nav-collapsed";

// The shell's nav. Client-side only because the active item is read off the
// current URL — every item is still a real link, so nothing routes
// imperatively.
export default function PortalNav({ openCount, admin, className = "" }) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [readStorage, setReadStorage] = useState(false);

  // The server has no localStorage to render from, so the first paint is
  // always open; the moment this runs client-side, it corrects itself to
  // whatever was remembered — before the browser paints, not after, so
  // there is no open-then-collapse flash.
  if (typeof window !== "undefined" && !readStorage) {
    setReadStorage(true);
    try {
      if (localStorage.getItem(STORAGE_KEY) === "1") setCollapsed(true);
    } catch {
      // Private browsing, or storage disabled — the rail just starts open.
    }
  }

  function toggle() {
    setCollapsed((current) => {
      const next = !current;
      try {
        localStorage.setItem(STORAGE_KEY, next ? "1" : "0");
      } catch {
        // Nothing to persist to; the toggle still works for this visit.
      }
      return next;
    });
  }

  const activeItem =
    pathname === "/" ? "/" : `/${pathname.split("/")[1]}`;

  return (
    <Sidebar
      tone="brand"
      collapsed={collapsed}
      onToggleCollapse={toggle}
      className={className}
      brand={
        collapsed ? (
          <span className="flex w-full items-center justify-center">
            <OpsMark className="size-7 shrink-0" />
          </span>
        ) : (
          <span className="flex items-center gap-2.5">
            <OpsMark className="size-7 shrink-0" />
            <span className="truncate text-[15px] font-semibold text-[var(--sand-50)]">
              Aqarly Housekeeping
            </span>
          </span>
        )
      }
      activeItem={activeItem}
      sections={[
        {
          items: [
            {
              value: "/requests",
              label: "Bookings",
              icon: "file-text",
              href: "/requests",
              count: openCount,
              // Open work is the number that should nag, so it carries the
              // alert tone rather than the neutral pill.
              countTone: "danger",
            },
            { value: "/units", label: "Buildings", icon: "building", href: "/units" },
            { value: "/staff", label: "Staff", icon: "users", href: "/staff" },
            { value: "/rates", label: "Rates", icon: "receipt", href: "/rates" },
            { value: "/", label: "Reports", icon: "sliders", href: "/" },
          ],
        },
      ]}
      footer={
        // Who is signed in, and the way out. Collapsed keeps just the avatar
        // and a sign-out icon.
        <div className="flex flex-col gap-2">
          <div
            title={collapsed ? `${admin.name} — ${admin.phone}` : undefined}
            className={[
              "flex items-center gap-2.5 py-0.5",
              collapsed ? "justify-center px-0" : "px-1",
            ].join(" ")}
          >
            <span className="flex size-8 shrink-0 items-center justify-center rounded-pill bg-[var(--green-400)] text-xs font-bold text-[var(--green-900)]">
              {initials(admin.name)}
            </span>
            {!collapsed && (
              <span className="min-w-0 flex-1">
                <span className="block truncate text-[13px] font-semibold text-[var(--sand-50)]">
                  {admin.name}
                </span>
                <span className="block truncate text-xs text-[var(--green-300)]">
                  {admin.phone}
                </span>
              </span>
            )}
          </div>

          <form action={signOutAction}>
            <button
              type="submit"
              title={collapsed ? "Sign out" : undefined}
              aria-label="Sign out"
              className={[
                "flex w-full cursor-pointer items-center gap-2 rounded-sm py-1.5 text-[12.5px] font-semibold text-[var(--green-200)] transition-colors hover:bg-white/[0.07] hover:text-[var(--sand-50)]",
                collapsed ? "justify-center px-0" : "px-1",
              ].join(" ")}
            >
              <Icon name="log-out" size={15} />
              {!collapsed && "Sign out"}
            </button>
          </form>
        </div>
      }
    />
  );
}

// "Property admin" → "PA".
function initials(name) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0].toUpperCase())
    .join("");
}
