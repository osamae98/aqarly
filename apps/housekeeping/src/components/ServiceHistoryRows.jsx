import Link from "next/link";
import ColumnFilter from "@/components/ColumnFilter";
import {
  categoryLabels,
  formatCharge,
  formatDate,
  stageLabels,
} from "@aqarly/core/operations";

// The per-unit record Ops PRD §7 calls for: what was done, who did it, what
// it was charged, and who it was billed to. The service filter sits in the
// Service header, the same idiom the queue uses.
const GRID =
  "grid grid-cols-[132px_84px_minmax(0,1fr)_140px_140px_100px_100px] items-center gap-3.5";

export default function ServiceHistoryRows({
  requests,
  categories = [],
  searchParams = {},
  basePath,
}) {
  return (
    <div className="min-w-[62rem] overflow-hidden rounded-md border border-border bg-surface">
      <div
        className={`${GRID} border-b border-border px-3 py-3 text-[11px] font-bold tracking-[0.1em] uppercase text-ink-muted`}
      >
        <span>Date</span>
        <span>Ref</span>
        <ColumnFilter
          label="Service"
          param="category"
          searchParams={searchParams}
          options={categories}
          basePath={basePath}
        />
        <span>Housekeeper</span>
        <span>Tenant</span>
        <span className="text-end">Charge</span>
        <span>Billed to</span>
      </div>

      {requests.length === 0 && (
        <p className="py-16 text-center text-sm text-ink-muted">
          Nothing has been booked for this unit yet.
        </p>
      )}

      <div className="divide-y divide-sunken">
        {requests.map((request) => {
          const open = request.stage !== "done";

          return (
            <Link
              key={request.id}
              href={`/requests/${request.id}`}
              className={`${GRID} group px-3 py-3.5 transition-colors hover:bg-page focus-visible:bg-page focus-visible:outline-none`}
            >
              <span className="block min-w-0 truncate text-[13.5px] font-semibold text-ink">
                {formatDate(request.createdAt)}
              </span>
              <span className="font-mono text-[12.5px] text-ink-soft group-hover:text-brand">
                {request.id}
              </span>
              <span className="min-w-0">
                <span className="block truncate text-[13.5px] text-ink">
                  {request.summary}
                </span>
                <span className="block truncate text-xs text-ink-muted">
                  {categoryLabels[request.category] ?? request.category} ·{" "}
                  {request.assignee ? stageLabels[request.stage] : "Unassigned"}
                </span>
              </span>
              <span className="min-w-0 truncate text-[13px] text-ink-soft">
                {request.assignee?.name ?? "—"}
              </span>
              <span className="min-w-0 truncate text-[13px] text-ink-soft">
                {request.tenant?.name ?? "—"}
              </span>
              <span className="text-end font-mono text-[13px] text-ink-soft">
                {open ? "pending" : formatCharge(request.charge)}
              </span>
              <span className="text-[13px] text-ink-soft">Tenant</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
