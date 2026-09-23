import { categoryLabels, formatCharge } from "@aqarly/core/operations";

// What the tenant will be charged, stated before the job can be closed and
// again to the tenant afterwards — no silent billing. The number is the one
// the booking was made at: `createRequest` froze it off the rate card, so it
// is read here, never typed, and a later change to the card never reprices a
// booking already made.
export default function ChargePanel({ job }) {
  if (job.type !== "housekeeping" || !job.charge) return null;

  return (
    <section className="flex flex-col gap-3 rounded-md bg-brand p-4 text-ink-inverse">
      <p className="font-mono text-[10.5px] font-bold tracking-[0.09em] uppercase opacity-80">
        What the tenant will be charged
      </p>

      <div className="flex items-baseline justify-between gap-3 border-b border-ink-inverse/20 pb-3">
        <span className="text-sm">
          {categoryLabels[job.category] ?? job.category}
        </span>
        <span className="font-mono text-sm font-semibold">
          {formatCharge(job.charge)}
        </span>
      </div>

      <div className="flex items-baseline justify-between gap-3">
        <span className="text-base font-bold">Total to tenant</span>
        <span className="font-mono text-xl font-bold">
          {formatCharge(job.charge)}
        </span>
      </div>

      <p className="rounded-sm bg-ink/20 px-3 py-2.5 text-[12.5px] leading-relaxed">
        Charged from the rate card at the price this booking was made at, not
        typed by you. The tenant sees this exact line before it reaches their
        statement.
      </p>
    </section>
  );
}
