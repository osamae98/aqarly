"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import Sidebar from "@aqarly/ui/Sidebar";
import { resetAction } from "@/app/actions";

// The shell's nav. Client-side only because the active item is read off the
// current URL — every item is still a real link, so nothing routes
// imperatively.
export default function OpsNav({ openCount, properties, className = "" }) {
  const pathname = usePathname();
  const propertyId = useSearchParams().get("propertyId");

  const activeItem =
    pathname === "/" ? "/" : `/${pathname.split("/")[1]}`;

  const scoped = properties.find((p) => p.id === propertyId);

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
            { value: "/units", label: "Units", icon: "building", href: "/units" },
            { value: "/staff", label: "Staff", icon: "users", href: "/staff" },
            { value: "/", label: "Reports", icon: "sliders", href: "/" },
            {
              value: "/rates",
              label: "Housekeeping rates",
              icon: "receipt",
              href: "/rates",
            },
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
    >
      <BuildingScope properties={properties} scoped={scoped} />
    </Sidebar>
  );
}

// The scope tree is domain content, not a nav pattern, so it lives here and
// fills the sidebar's own slot.
function BuildingScope({ properties, scoped }) {
  return (
    <div className="mt-1 flex min-h-0 flex-1 flex-col border-t border-white/10 pt-3">
      <div className="flex items-center justify-between px-3 pb-2">
        <span className="text-xs font-semibold tracking-[0.1em] uppercase text-[var(--green-300)]">
          My scope
        </span>
        <span className="text-xs font-semibold text-[var(--green-200)]">
          {scoped ? `1 of ${properties.length}` : `${properties.length} of ${properties.length}`}
        </span>
      </div>

      <div className="flex flex-col gap-px">
        {properties.map((property) => {
          const active = scoped?.id === property.id;

          return (
            <Link
              key={property.id}
              href={`/requests?propertyId=${property.id}`}
              className={[
                "flex items-center gap-2.5 rounded-sm px-2.5 py-2 text-[13px] transition-colors",
                active
                  ? "bg-white/10 text-[var(--sand-50)]"
                  : "text-[var(--green-100)] hover:bg-white/[0.07]",
              ].join(" ")}
            >
              <span
                className={[
                  "size-1.5 shrink-0 rounded-pill",
                  property.unassigned > 0
                    ? "bg-danger"
                    : property.open > 0
                      ? "bg-[var(--amber-300)]"
                      : "bg-[var(--green-400)]",
                ].join(" ")}
              />
              <span className="min-w-0 flex-1 truncate">{property.name}</span>
              <span className="font-mono text-[11.5px] text-[var(--green-300)]">
                {property.units}
              </span>
              <span
                className={[
                  "min-w-5 text-end font-mono text-[11.5px] font-bold",
                  property.unassigned > 0
                    ? "text-[var(--red-300)]"
                    : "text-[var(--green-200)]",
                ].join(" ")}
              >
                {property.open}
              </span>
            </Link>
          );
        })}
      </div>

      {scoped && (
        <Link
          href="/requests"
          className="px-2.5 pt-2.5 text-[12.5px] text-[var(--green-300)] hover:text-[var(--green-100)]"
        >
          Widen to full portfolio →
        </Link>
      )}
    </div>
  );
}
