import { categoryLabels, repeatFaultRule, typeLabels } from "@aqarly/core/operations";
import JobActions from "./JobActions";

// The one job the screen leads with, drawn as a slab rather than another row:
// on a phone held in one hand the next action has to be unmissable and
// full-width. An emergency turns the slab red; everything else stays brand
// green. Neither says anything about a clock — what makes this the next job
// is that it is started, or urgent, or the oldest thing still open.
export default function NextJobCard({ job }) {
  const urgent = job.priority === "urgent";
  const started = job.stage === "in-progress";

  return (
    <section
      className={[
        "flex flex-col gap-4 rounded-lg p-5 text-ink-inverse",
        urgent ? "bg-danger" : "bg-brand",
      ].join(" ")}
    >
      <div className="flex items-center justify-between gap-3">
        <span className="rounded-pill bg-ink-inverse/20 px-2.5 py-1 text-[10.5px] font-bold tracking-[0.09em] uppercase">
          {started ? "In progress" : "Do this next"}
        </span>
        <span className="font-mono text-[11px] font-bold tracking-[0.08em] opacity-80 uppercase">
          {typeLabels[job.type]} · {categoryLabels[job.category] ?? job.category}
        </span>
      </div>

      <div className="flex flex-col gap-1.5">
        <h2 className="text-[22px] leading-tight font-bold tracking-[-0.015em]">
          {job.summary}
        </h2>
        <p className="text-sm opacity-90">
          {[job.unit ? `Unit ${job.unit.label}` : null, job.property?.name]
            .filter(Boolean)
            .join(" · ")}
        </p>
        {job.tenant && <p className="text-sm opacity-90">{job.tenant.name}</p>}
      </div>

      {/* The one thing worth telling a technician before they start: the fix
       * that keeps not holding is a different job from the one on the ticket.
       * Same rule the ops portal flags the unit with. */}
      {job.repeatFault && (
        <p className="rounded-md bg-ink/20 px-3.5 py-3 text-[13.5px] leading-relaxed">
          <strong className="font-bold">
            {job.repeatFault.count} {categoryLabels[job.repeatFault.category]} visits
          </strong>{" "}
          to this unit in the last {repeatFaultRule.withinDays} days. Check the
          cause before another like-for-like repair.
        </p>
      )}

      <JobActions job={job} tone="onDark" />
    </section>
  );
}
