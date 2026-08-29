import Badge from "@aqarly/ui/Badge";
import Initials from "@/components/Initials";
import { typeLabels } from "@aqarly/core/operations";

const GRID =
  "grid grid-cols-[220px_128px_minmax(0,1fr)_72px_150px] items-center gap-3.5";

export default function StaffRows({ staff }) {
  return (
    <div className="min-w-[54rem]">
      <div className={`${GRID} pb-2.5 text-[11px] font-bold tracking-[0.1em] uppercase text-ink-muted`}>
        <span>Name · staff id</span>
        <span>Trade</span>
        <span>Buildings</span>
        <span className="text-end">Closed</span>
        <span>Current load</span>
      </div>

      {staff.map((member) => {
        const pct = Math.min(100, (member.load / member.capacity) * 100);

        return (
          <div key={member.id} className={`${GRID} border-t border-border py-3.5`}>
            <span className="flex min-w-0 items-center gap-2.5">
              <Initials name={member.name} size={34} />
              <span className="min-w-0">
                <span className="block truncate text-sm font-semibold text-ink">
                  {member.name}
                </span>
                {/* Identity is the HRMS's job from Phase 3; this stands in. */}
                <span className="block font-mono text-[11.5px] text-ink-muted">
                  {member.id}
                </span>
              </span>
            </span>

            <span>
              <Badge tone={member.role} dot={false}>
                {typeLabels[member.role] ?? member.role}
              </Badge>
            </span>

            <span className="min-w-0 truncate text-[13px] text-ink-soft">
              {member.properties.length
                ? member.properties.map((p) => p?.name).filter(Boolean).join(", ")
                : "No work yet"}
            </span>

            <span className="text-end font-mono text-[13px] text-ink-soft">
              {member.closed}
            </span>

            <span className="flex items-center gap-2">
              <span className="h-1.5 flex-1 overflow-hidden rounded-pill bg-sunken">
                {/* Fill is data-driven. */}
                <span
                  className={[
                    "block h-full rounded-pill",
                    pct >= 100 ? "bg-danger" : pct > 70 ? "bg-warning" : "bg-brand",
                  ].join(" ")}
                  style={{ width: `${pct}%` }}
                />
              </span>
              <span className="shrink-0 font-mono text-[11.5px] text-ink-soft">
                {member.load}/{member.capacity}
              </span>
            </span>
          </div>
        );
      })}
    </div>
  );
}
