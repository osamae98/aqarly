"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import Sidebar from "@aqarly/ui/Sidebar";
import { resetAction } from "@/app/actions";
import OpsMark from "@/components/OpsMark";

// Remembered across visits — a rail an admin collapsed yesterday should stay
// collapsed, the same way a window's size does.
const STORAGE_KEY = "aqarly-ops-nav-collapsed";

// The shell's nav. Client-side only because the active item is read off the
// current URL — every item is still a real link, so nothing routes
// imperatively.
export default function OpsNav({ openCount, className = "" }) {
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
        <span
          className={[
            "flex items-center",
            collapsed ? "w-full justify-center" : "gap-2.5",
          ].join(" ")}
        >
          <OpsMark className="size-7 shrink-0" />
          {!collapsed && (
            <span className="truncate text-[15px] font-semibold text-[var(--sand-50)]">
              Aqarly Ops
            </span>
          )}
        </span>
      }
      activeItem={activeItem}
      sections={[
        {
          items: [
            {
              value: "/requests",
              label: "Requests",
              icon: "file-text",
              href: "/requests",
              count: openCount,
              // Open work is the number that should nag, so it carries the
              // alert tone rather than the neutral pill.
              countTone: "danger",
            },
            { value: "/units", label: "Buildings", icon: "building", href: "/units" },
            { value: "/staff", label: "Staff", icon: "users", href: "/staff" },
            { value: "/", label: "Reports", icon: "sliders", href: "/" },
          ],
        },
      ]}
      footer={
        // No auth anywhere yet, so this names the role the screens are
        // designed for rather than a signed-in person. Collapsed keeps just
        // the avatar — "Reset demo data" is rare enough to live behind
        // expanding the rail rather than becoming an icon that has to guess
        // at its own meaning.
        <div className="flex flex-col gap-2">
          <div
            title={collapsed ? "Property admin — No sign-in yet" : undefined}
            className={[
              "flex items-center gap-2.5 py-0.5",
              collapsed ? "justify-center px-0" : "px-1",
            ].join(" ")}
          >
            <span className="flex size-8 shrink-0 items-center justify-center rounded-pill bg-[var(--green-400)] text-xs font-bold text-[var(--green-900)]">
              PA
            </span>
            {!collapsed && (
              <span className="min-w-0">
                <span className="block truncate text-[13px] font-semibold text-[var(--sand-50)]">
                  Property admin
                </span>
                <span className="block text-xs text-[var(--green-300)]">
                  No sign-in yet
                </span>
              </span>
            )}
          </div>

          {/* Writes live in the server process, not in the seed file, so this
            * is the way back to a known state. */}
          {!collapsed && (
            <form action={resetAction}>
              <button
                type="submit"
                className="w-full cursor-pointer rounded-sm px-1 py-1 text-start text-[11.5px] text-[var(--green-300)] transition-colors hover:bg-white/[0.07] hover:text-[var(--green-100)]"
              >
                Reset demo data
              </button>
            </form>
          )}
        </div>
      }
    />
  );
}
