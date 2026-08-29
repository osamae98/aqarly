import Link from "next/link";
import ColumnFilter from "@/components/ColumnFilter";
import {
  categoryLabels,
  formatCharge,
  formatDate,
  stageLabels,
} from "@aqarly/core/operations";

// The per-unit record Ops PRD §7 calls for: what was done, who did it, what
// it cost, and who it was billed to. The category filter sits in the Work
// header, the same idiom the queue uses.
const GRID =
  "grid grid-cols-[132px_84px_minmax(0,1fr)_140px_100px_100px] items-center gap-3.5";

export default function ServiceHistoryRows({
  requests,
  categories = [],
  searchParams = {},
  basePath,
}) {
  return (
    <div className="min-w-[56rem]">
      <div className={`${GRID} pb-2.5 text-[11px] font-bold tracking-[0.1em] uppercase text-ink-muted`}>
        <span>Date</span>
        <span>Ref</span>
        <ColumnFilter
          label="Work"
          param="category"
          searchParams={searchParams}
          options={categories}
          basePath={basePath}
        />
        <span>Technician</span>
        <span className="text-end">Cost</span>
        <span>Billed to</span>
      </div>

      {requests.length === 0 && (
        <p className="border-t border-border py-16 text-center text-sm text-ink-muted">
          Nothing has been raised for this unit yet.
        </p>
      )}

      {requests.map((request) => {
        const open = request.stage !== "done";

        return (
          <div
            key={request.id}
            className={`border-t border-border py-3.5 ${GRID}`}
          >
            <span className="block min-w-0 truncate text-[13.5px] font-semibold text-ink">
              {formatDate(request.createdAt)}
            </span>
            <span>
              <Link
                href={`/requests/${request.id}`}
                className="font-mono text-[12.5px] text-ink-soft hover:text-brand"
              >
                {request.id}
              </Link>
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
            <span className="text-end font-mono text-[13px] text-ink-soft">
              {open ? "pending" : formatCharge(request.charge)}
            </span>
            <span className="text-[13px] text-ink-soft">
              {request.type === "housekeeping" ? "Tenant" : "Landlord"}
            </span>
          </div>
        );
      })}
    </div>
  );
}
