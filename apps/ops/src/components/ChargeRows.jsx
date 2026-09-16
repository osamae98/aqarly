import Link from "next/link";
import Badge from "@aqarly/ui/Badge";
import { formatCharge, formatDate } from "@aqarly/core/operations";

// The Charges tab reports money rather than work, so it gets its own columns:
// what was charged, against whom, and whether the job it belongs to has
// closed. Payment state itself has nowhere to live until there is a billing
// system, so "Charged" means the work is done and the amount is final.
const GRID =
  "grid grid-cols-[132px_84px_minmax(0,1fr)_110px_110px_100px] items-center gap-3.5";

export default function ChargeRows({ requests }) {
  return (
    <div className="min-w-[54rem]">
      <div className={`${GRID} pb-2.5 text-[11px] font-bold tracking-[0.1em] uppercase text-ink-muted`}>
        <span>Date</span>
        <span>Ref</span>
        <span>Description</span>
        <span className="text-end">Amount</span>
        <span>Billed to</span>
        <span>Status</span>
      </div>

      {requests.length === 0 && (
        <p className="border-t border-border py-16 text-center text-sm text-ink-muted">
          Nothing has been charged against this unit.
        </p>
      )}

      {requests.map((request) => {
        const settled = request.stage === "done";

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
            <span className="min-w-0 truncate text-[13.5px] text-ink">
              {request.summary}
            </span>
            <span className="text-end font-mono text-[13px] font-semibold text-ink">
              {formatCharge(request.charge)}
            </span>
            <span className="text-[13px] text-ink-soft">Landlord</span>
            <span>
              <Badge tone={settled ? "success" : "warning"} dot={false}>
                {settled ? "Charged" : "Pending"}
              </Badge>
            </span>
          </div>
        );
      })}
    </div>
  );
}
