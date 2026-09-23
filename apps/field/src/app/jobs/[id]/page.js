import { notFound } from "next/navigation";
import {
  categoryLabels,
  formatDateTime,
  getJob,
  getSignedInTechnician,
  repeatFaultRule,
  typeLabels,
} from "@aqarly/core/operations";
import Icon from "@aqarly/ui/Icon";
import ChargePanel from "@/components/ChargePanel";
import JobActions from "@/components/JobActions";
import PhotoStrip from "@/components/PhotoStrip";
import ScreenHeader from "@/components/ScreenHeader";
import SectionLabel from "@/components/SectionLabel";

export async function generateMetadata({ params }) {
  const { id } = await params;
  const technician = await getSignedInTechnician();
  const job = await getJob(id, technician.id);
  return { title: job ? `${job.id} — ${job.summary}` : "Job" };
}

function Fact({ icon, label, children }) {
  return (
    <div className="flex items-start gap-3 py-3.5">
      <span className="flex size-8 shrink-0 items-center justify-center rounded-sm bg-sunken text-ink-soft">
        <Icon name={icon} size={16} />
      </span>
      <span className="flex min-w-0 flex-col gap-0.5">
        <span className="text-xs font-semibold text-ink-muted">{label}</span>
        <span className="text-[15px] text-ink">{children}</span>
      </span>
    </div>
  );
}

export default async function JobPage({ params }) {
  const { id } = await params;
  const technician = await getSignedInTechnician();

  // `getJob` only resolves work this technician holds, so a job reassigned
  // out from under them stops opening rather than staying actionable.
  const job = await getJob(id, technician.id);
  if (!job) notFound();

  const done = job.stage === "done";
  const closedAt = job.stageHistory.find((entry) => entry.stage === "done")?.at;

  return (
    <>
      <ScreenHeader backHref="/" eyebrow={job.id} title={job.summary} />

      <main className="flex flex-1 flex-col gap-5 p-4 pb-10">
        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded-pill border border-border-strong bg-surface px-2.5 py-1 text-[11px] font-bold tracking-[0.05em] text-ink-soft uppercase">
            {typeLabels[job.type]} · {categoryLabels[job.category] ?? job.category}
          </span>
          {job.priority === "urgent" && !done && (
            <span className="rounded-pill bg-danger-tint px-2.5 py-1 text-[11px] font-bold tracking-[0.05em] text-danger-ink uppercase">
              Urgent
            </span>
          )}
          {done && (
            <span className="rounded-pill bg-stage-done-tint px-2.5 py-1 text-[11px] font-bold tracking-[0.05em] text-stage-done uppercase">
              Closed {closedAt ? formatDateTime(closedAt) : ""}
            </span>
          )}
        </div>

        {job.repeatFault && (
          <p className="rounded-md bg-warning-tint px-4 py-3 text-[13.5px] leading-relaxed text-warning-ink">
            <strong className="font-bold">
              {job.repeatFault.count} {categoryLabels[job.repeatFault.category]} visits
            </strong>{" "}
            to this unit in the last {repeatFaultRule.withinDays} days. Check the
            cause before another like-for-like repair.
          </p>
        )}

        {/* What the tenant actually said, in their words. */}
        <section className="flex flex-col gap-2">
          <SectionLabel>Description</SectionLabel>
          <p className="rounded-lg bg-surface p-4 text-[15px] leading-relaxed text-ink shadow-sm">
            {job.description ? (
              `“${job.description}”`
            ) : (
              <span className="text-ink-muted">No description was given.</span>
            )}
          </p>
        </section>

        <PhotoStrip label="What the tenant sent" photos={job.photos} />

        <section className="flex flex-col gap-2">
          <SectionLabel>Details</SectionLabel>
          <div className="flex flex-col divide-y divide-border rounded-lg bg-surface px-4 shadow-sm">
            <Fact icon="home" label="Unit">
              {job.unit ? `Unit ${job.unit.label}` : "—"}
              {job.unit ? ` · ${job.unit.bedrooms} BR, ${job.unit.bathrooms} bath` : ""}
            </Fact>
            <Fact icon="building" label="Building">{job.property?.name ?? "—"}</Fact>
            <Fact icon="user" label="Tenant">
              {job.tenant ? `${job.tenant.name} · ${job.tenant.phone}` : "Vacant unit"}
            </Fact>
            <Fact icon="calendar" label="Raised">{formatDateTime(job.createdAt)}</Fact>
          </div>
        </section>

        <ChargePanel job={job} />

        {done ? (
          <>
            <section className="flex flex-col gap-2">
              <SectionLabel>What you logged</SectionLabel>
              <p className="rounded-lg bg-surface p-4 text-[15px] leading-relaxed text-ink shadow-sm">
                {job.completionNotes ?? (
                  <span className="text-ink-muted">No note was left.</span>
                )}
              </p>
            </section>
            <PhotoStrip label="Your photos" photos={job.completionPhotos} />
          </>
        ) : (
          <JobActions job={job} />
        )}
      </main>
    </>
  );
}
