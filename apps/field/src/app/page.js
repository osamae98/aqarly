import Logo from "@aqarly/ui/Logo";
import { getSignedInTechnician, getWorklist, typeLabels } from "@aqarly/core/operations";
import { signOutAction } from "@/app/actions";
import JobRow from "@/components/JobRow";
import NextJobCard from "@/components/NextJobCard";
import SectionLabel from "@/components/SectionLabel";
import StatTiles from "@/components/StatTiles";
import EmptyState from "@/components/EmptyState";

// The worklist. No queue, no filters, no dashboard — one technician's own
// open work, in the order `getWorklist` decides it should be done, with the
// next action as a full-width button.
export default async function WorklistPage() {
  const technician = await getSignedInTechnician();
  const worklist = await getWorklist(technician.id);
  const { next, queued, closed, counts } = worklist;

  return (
    <main className="flex flex-1 flex-col gap-5 p-4 pb-10">
      <header className="flex items-center gap-3 pt-2">
        <Logo size={34} />
        <div className="flex min-w-0 flex-1 flex-col gap-0.5">
          <p className="font-mono text-[11px] font-bold tracking-[0.09em] text-ink-muted uppercase">
            {typeLabels[technician.role] ?? technician.role}, {technician.name}
          </p>
          <h1 className="truncate text-[26px] leading-tight font-bold tracking-[-0.02em] text-ink">
            Your work
          </h1>
        </div>
      </header>

      <StatTiles counts={counts} />

      {next ? (
        <NextJobCard job={next} />
      ) : (
        <EmptyState
          art="clear"
          title="No open jobs"
          description="You're all caught up."
          className="rounded-lg border border-border bg-surface px-6"
        />
      )}

      {queued.length > 0 && (
        <section className="flex flex-col gap-2.5">
          <SectionLabel>Then</SectionLabel>
          {queued.map((job) => (
            <JobRow key={job.id} job={job} />
          ))}
        </section>
      )}

      {closed.length > 0 && (
        <section className="flex flex-col gap-2.5">
          <SectionLabel>Closed</SectionLabel>
          {closed.map((job) => (
            <JobRow key={job.id} job={job} done />
          ))}
        </section>
      )}

      <form action={signOutAction} className="self-center">
        <button type="submit" className="h-12 px-4 text-sm font-semibold text-ink-soft">
          Sign out
        </button>
      </form>
    </main>
  );
}
