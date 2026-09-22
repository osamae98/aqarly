"use client";

import { useState } from "react";
import Link from "next/link";
import Icon from "@aqarly/ui/Icon";
import { handBackAction, startJobAction } from "@/app/actions";
import { FormNote, useFormAction } from "./Field";

// The three things a technician can do to a job, in the order the design puts
// them: get on with it, ask the tenant something first, or hand it back.
// Drawn twice — once on the dark hero card, once on the job's own screen — so
// the palette is a prop and nothing else changes.
const palettes = {
  onDark: {
    primary: "bg-surface text-ink active:bg-sunken",
    secondary: "border-ink-inverse/40 text-ink-inverse active:bg-ink-inverse/10",
  },
  plain: {
    primary: "bg-brand text-ink-inverse active:bg-brand-active",
    secondary: "border-border-strong text-ink active:bg-sunken",
  },
};

const base =
  "flex h-13 items-center justify-center gap-2 whitespace-nowrap rounded-pill px-5 text-base font-semibold transition-colors disabled:opacity-50";

// The pair under the primary share one row on a 375px screen, so they trade
// some padding for the room their labels actually need.
const paired = "flex-1 border-[1.5px] px-3 text-[15px]";

export default function JobActions({ job, tone = "plain" }) {
  const palette = palettes[tone] ?? palettes.plain;
  const [asking, setAsking] = useState(false);

  const start = useFormAction(startJobAction);
  const handBack = useFormAction(handBackAction, {
    onSuccess: () => setAsking(false),
  });

  const started = job.stage === "in-progress";

  return (
    <div className="flex flex-col gap-2.5">
      {started ? (
        <Link href={`/jobs/${job.id}/finish`} className={`${base} ${palette.primary}`}>
          Finish this job
        </Link>
      ) : (
        <form action={start.submit}>
          <input type="hidden" name="id" value={job.id} />
          <button
            type="submit"
            disabled={start.pending}
            className={`${base} w-full ${palette.primary}`}
          >
            {start.pending ? "Starting…" : "Start job"}
          </button>
        </form>
      )}

      <div className="flex gap-2.5">
        {/* A real `tel:` link. The seed's numbers are placeholders, but the
         * control is not — there is nothing here that needs a backend. */}
        <a
          href={job.tenant?.phone ? `tel:${job.tenant.phone.replace(/\s/g, "")}` : undefined}
          aria-disabled={!job.tenant?.phone}
          className={[
            base,
            paired,
            palette.secondary,
            job.tenant?.phone ? "" : "pointer-events-none opacity-50",
          ].join(" ")}
        >
          <Icon name="phone" size={17} />
          Call tenant
        </a>

        <button
          type="button"
          onClick={() => setAsking(true)}
          className={`${base} ${paired} ${palette.secondary}`}
        >
          Can&rsquo;t do it
        </button>
      </div>

      {start.result?.error && (
        <p role="alert" className="text-sm font-medium text-ink-inverse">
          {start.result.error}
        </p>
      )}

      {asking && (
        <HandBackSheet job={job} action={handBack} onClose={() => setAsking(false)} />
      )}
    </div>
  );
}

// Handing a job back is not a refusal, so the sheet asks for the one thing
// that makes it useful to the office: why. The reason is required — a job
// reappearing in the queue with no explanation is worse than one that never
// left it.
function HandBackSheet({ job, action, onClose }) {
  return (
    <div className="fixed inset-0 z-30 flex items-end justify-center bg-ink/50">
      <button
        type="button"
        aria-label="Close"
        onClick={onClose}
        className="absolute inset-0 cursor-default"
      />

      <form
        action={action.submit}
        className="relative z-10 flex w-full max-w-md flex-col gap-4 rounded-t-lg bg-surface p-5 pb-8"
      >
        <input type="hidden" name="id" value={job.id} />

        <div className="flex flex-col gap-1">
          <h2 className="text-lg font-bold text-ink">Hand this job back</h2>
          <p className="text-sm text-ink-soft">
            {job.id} goes back to the office unassigned, with your reason on it.
            It does not get closed.
          </p>
        </div>

        <div className="flex flex-col gap-1.5">
          <label
            htmlFor="reason"
            className="text-xs font-bold tracking-[0.08em] uppercase text-ink-muted"
          >
            Why
          </label>
          <textarea
            id="reason"
            name="reason"
            rows={3}
            required
            autoFocus
            placeholder="Need a part I don't carry, no access to the unit, wrong trade…"
            className="resize-y rounded-md border border-border bg-page px-4 py-3 text-base text-ink placeholder:text-ink-muted focus:border-brand focus:shadow-focus focus:outline-none"
          />
        </div>

        <FormNote state={action.result} />

        <div className="flex gap-2.5">
          <button
            type="button"
            onClick={onClose}
            className={`${base} flex-1 border-[1.5px] border-border-strong text-ink active:bg-sunken`}
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={action.pending}
            className={`${base} flex-1 bg-brand text-ink-inverse active:bg-brand-active`}
          >
            {action.pending ? "Sending…" : "Hand back"}
          </button>
        </div>
      </form>
    </div>
  );
}
