"use client";

import { usePathname } from "next/navigation";
import Sidebar from "@aqarly/ui/Sidebar";
import { resetAction } from "@/app/actions";

// The shell's nav. Client-side only because the active item is read off the
// current URL — every item is still a real link, so nothing routes
// imperatively.
export default function OpsNav({ openCount, className = "" }) {
  const pathname = usePathname();

  const activeItem =
    pathname === "/" ? "/" : `/${pathname.split("/")[1]}`;

  return (
    <Sidebar
      tone="brand"
      className={className}
      brand={
        <span className="flex items-center gap-2.5">
          <span className="flex size-7 items-center justify-center rounded-sm bg-[var(--green-400)] text-sm font-bold text-[var(--green-900)]">
            A
          </span>
          <span className="text-[15px] font-semibold text-[var(--sand-50)]">
            Aqarly Ops
          </span>
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
        // designed for rather than a signed-in person.
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2.5 px-1 py-0.5">
            <span className="flex size-8 shrink-0 items-center justify-center rounded-pill bg-[var(--green-400)] text-xs font-bold text-[var(--green-900)]">
              PA
            </span>
            <span className="min-w-0">
              <span className="block truncate text-[13px] font-semibold text-[var(--sand-50)]">
                Property admin
              </span>
              <span className="block text-xs text-[var(--green-300)]">
                No sign-in yet
              </span>
            </span>
          </div>

          {/* Writes live in the server process, not in the seed file, so this
            * is the way back to a known state. */}
          <form action={resetAction}>
            <button
              type="submit"
              className="w-full cursor-pointer rounded-sm px-1 py-1 text-start text-[11.5px] text-[var(--green-300)] transition-colors hover:bg-white/[0.07] hover:text-[var(--green-100)]"
            >
              Reset demo data
            </button>
          </form>
        </div>
      }
    />
  );
}
