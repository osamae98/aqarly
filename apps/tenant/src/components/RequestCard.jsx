import Link from "next/link";
import { formatAge, formatCharge, formatDateTime } from "@aqarly/core/operations";
import StageTag from "./StageTag";
import TypeTag from "./TypeTag";

function subtitle(request) {
  const unit = request.unit ? `Unit ${request.unit.label}` : null;
  const doneAt = request.stageHistory.find((entry) => entry.stage === "done")?.at;

  const when = doneAt
    ? `Completed ${formatDateTime(doneAt)}`
    : `Reported ${formatAge(request.ageHours)} ago`;

  return [unit, when].filter(Boolean).join(" — ");
}

export default function RequestCard({ request }) {
  return (
    <Link
      href={`/requests/${request.id}`}
      className="block rounded-md border border-border bg-surface p-5 transition hover:-translate-y-0.5 hover:shadow-md"
    >
      <TypeTag type={request.type} />
      <h3 className="mt-3 text-base font-semibold text-ink">
        {request.summary}
      </h3>
      <p className="mt-2 text-sm text-ink-soft">{subtitle(request)}</p>
      <div className="mt-3 flex items-center justify-between gap-3">
        <span className="text-xs text-ink-muted">
          {request.charge ? formatCharge(request.charge) : ""}
        </span>
        <StageTag stage={request.stage} />
      </div>
    </Link>
  );
}
