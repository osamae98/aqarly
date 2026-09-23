import Link from "next/link";
import { notFound } from "next/navigation";
import {
  categoryLabels,
  formatCharge,
  getJob,
  getSignedInTechnician,
  maxCompletionPhotos,
  requiredCompletionPhotos,
  typeLabels,
} from "@aqarly/core/operations";
import ChargePanel from "@/components/ChargePanel";
import FinishForm from "@/components/FinishForm";
import ScreenHeader from "@/components/ScreenHeader";

export async function generateMetadata({ params }) {
  const { id } = await params;
  return { title: `Finish ${id}` };
}

export default async function FinishJobPage({ params }) {
  const { id } = await params;
  const technician = await getSignedInTechnician();
  const job = await getJob(id, technician.id);
  if (!job) notFound();

  // A job is closed from the site, so it has to have been started from the
  // site first. Anything else is a link followed out of order.
  if (job.stage !== "in-progress") {
    return (
      <>
        <ScreenHeader backHref={`/jobs/${job.id}`} eyebrow={job.id} title="Finish this job" />
        <main className="flex flex-1 flex-col items-center gap-3 p-6 py-16 text-center">
          <h2 className="text-lg font-bold text-ink">
            {job.stage === "done" ? "Already closed" : "Not started yet"}
          </h2>
          <p className="max-w-xs text-sm text-ink-soft">
            {job.stage === "done"
              ? "This job has been marked done. Nothing left to log."
              : "Start the job when you get to the unit — then you can close it."}
          </p>
          <Link
            href={`/jobs/${job.id}`}
            className="mt-2 flex h-12 items-center rounded-pill border-[1.5px] border-border-strong px-6 text-base font-semibold text-ink"
          >
            Back to the job
          </Link>
        </main>
      </>
    );
  }

  // Maintenance is the landlord's cost and is never billed on, so only a
  // housekeeping job has a figure to put on the button.
  const submitLabel = job.charge
    ? `Mark done · charge ${formatCharge(job.charge)}`
    : "Mark done";

  return (
    <>
      <ScreenHeader backHref={`/jobs/${job.id}`} eyebrow={job.id} title="Finish this job" />

      <main className="flex flex-1 flex-col gap-5 p-4 pb-10">
        <section className="flex flex-col gap-1 rounded-lg bg-surface p-4 shadow-sm">
          <p className="font-mono text-[10.5px] font-bold tracking-[0.09em] text-ink-muted uppercase">
            {typeLabels[job.type]} · {categoryLabels[job.category] ?? job.category}
          </p>
          <h2 className="text-[17px] leading-snug font-bold text-ink">
            {job.summary}
          </h2>
          <p className="text-[13px] text-ink-soft">
            {[job.unit ? `Unit ${job.unit.label}` : null, job.property?.name]
              .filter(Boolean)
              .join(" · ")}
          </p>
        </section>

        <ChargePanel job={job} />

        <FinishForm
          job={{ id: job.id }}
          submitLabel={submitLabel}
          required={requiredCompletionPhotos}
          max={maxCompletionPhotos}
        />
      </main>
    </>
  );
}
