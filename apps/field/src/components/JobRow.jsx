import Link from "next/link";
import Icon from "@aqarly/ui/Icon";
import {
  categoryCodes,
  categoryLabels,
  formatCharge,
  formatDateTime,
} from "@aqarly/core/operations";

// The two-letter tile the ops portal leads a request with, reused here so a
// technician and an admin are looking at the same shorthand.
function Marker({ job, done }) {
  if (done) {
    return (
      <span className="flex size-10 shrink-0 items-center justify-center rounded-sm bg-stage-done-tint text-stage-done">
        <Icon name="check" size={18} />
      </span>
    );
  }

  const tone =
    job.type === "housekeeping"
      ? "bg-category-housekeeping-tint text-category-housekeeping"
      : "bg-category-maintenance-tint text-category-maintenance";

  return (
    <span
      className={`flex size-10 shrink-0 items-center justify-center rounded-sm font-mono text-[13px] font-bold ${tone}`}
      title={categoryLabels[job.category] ?? job.category}
    >
      {categoryCodes[job.category] ?? "GN"}
    </span>
  );
}

// A queued job states where it is and whether it jumps the line. A closed one
// states when it was closed and what it was billed at, if anything — those
// are the two facts a technician gets asked about afterwards.
function caption(job, done) {
  if (done) {
    const closedAt = job.stageHistory.find((entry) => entry.stage === "done")?.at;
    const parts = [closedAt ? `Closed ${formatDateTime(closedAt)}` : "Closed"];
    if (job.charge) parts.push(`${formatCharge(job.charge)} billed`);
    return parts.join(" · ");
  }

  return [job.property?.name, job.unit ? `Unit ${job.unit.label}` : null]
    .filter(Boolean)
    .join(" · ");
}

export default function JobRow({ job, done = false }) {
  return (
    <Link
      href={`/jobs/${job.id}`}
      className="flex items-center gap-3 rounded-lg bg-surface px-3.5 py-3 shadow-sm active:bg-sunken"
    >
      <Marker job={job} done={done} />

      <span className="flex min-w-0 flex-1 flex-col gap-0.5">
        <span className="flex items-center gap-2">
          <span className="min-w-0 flex-1 truncate text-[15px] font-semibold text-ink">
            {job.summary}
          </span>
          {!done && job.priority === "urgent" && (
            <span className="shrink-0 rounded-pill bg-danger-tint px-2 py-0.5 text-[10px] font-bold tracking-[0.06em] text-danger-ink uppercase">
              Urgent
            </span>
          )}
        </span>
        <span className="truncate text-[13px] text-ink-soft">
          {caption(job, done)}
        </span>
      </span>

      <Icon name="chevron-right" size={18} className="shrink-0 text-ink-muted" />
    </Link>
  );
}
