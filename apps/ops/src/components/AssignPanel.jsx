"use client";

import { useState } from "react";
import Slideout from "@aqarly/ui/Slideout";
import Initials from "@/components/Initials";
import { FormNote, Label, useFormAction } from "@/components/Field";
import { MicroLabel } from "@/components/Panel";
import Toast from "@/components/Toast";
import { assignAction } from "@/app/actions";
import { typeLabels } from "@aqarly/core/labels";

// Why this person is the suggestion, in the order the ranking weighs it.
function reason(candidate) {
  if (candidate.atCapacity) {
    return `At capacity — ${candidate.load} of ${candidate.capacity} jobs open`;
  }

  const parts = [`${typeLabels[candidate.role] ?? candidate.role} crew`];
  if (candidate.inBuilding) parts.push("already working this building");
  parts.push(
    candidate.load === 0
      ? "free now"
      : `${candidate.load} ${candidate.load === 1 ? "job" : "jobs"} in hand`,
  );

  return parts.join(" · ");
}

export default function AssignPanel({
  open,
  onClose,
  candidates = [],
  requestIds = [],
  eyebrow,
  title,
  description,
  note,
  onAssigned,
}) {
  const [picked, setPicked] = useState(0);
  const choice = candidates[picked];

  // The panel closes on success and the toast carries the confirmation, the
  // same shape the mockup's flow has.
  const { submit, pending, result } = useFormAction(assignAction, {
    onSuccess: () => {
      onAssigned?.();
      onClose?.();
    },
  });

  return (
    <>
      <Slideout
        open={open}
        onClose={onClose}
        eyebrow={eyebrow}
        title={title}
        description={description}
        footer={
          <div className="flex w-full flex-col gap-3">
            {note && (
              <div className="flex flex-col gap-1.5">
                <MicroLabel>Note for the technician</MicroLabel>
                <p className="min-h-12 rounded-sm border border-border bg-page p-2.5 text-[13.5px] text-ink-muted">
                  {note}
                </p>
              </div>
            )}

            <p className="text-xs text-ink-muted">
              Assigning moves the request to the chosen technician. Notifying
              the tenant needs a messaging path, so nothing is sent yet.
            </p>

            <FormNote state={result} />

            <button
              type="submit"
              form="assign-request"
              disabled={!choice || pending || requestIds.length === 0}
              className="w-full cursor-pointer rounded-pill bg-brand py-3.5 text-[15px] font-semibold text-ink-inverse transition-colors hover:bg-brand-hover disabled:cursor-not-allowed disabled:opacity-45"
            >
              {pending
                ? "Assigning…"
                : choice
                  ? `Assign to ${choice.name.split(" ")[0]} · notify tenant`
                  : "Assign"}
            </button>
            <button
              type="button"
              disabled
              title="No vendor directory yet"
              className="w-full cursor-not-allowed rounded-pill border border-border-strong py-3 text-sm font-semibold text-ink-soft opacity-45"
            >
              Send to external vendor
            </button>
          </div>
        }
      >
        {candidates.length === 0 ? (
          <p className="text-sm text-ink-muted">
            No one on the roster covers this kind of work yet.
          </p>
        ) : (
          <form
            id="assign-request"
            action={submit}
            className="flex flex-col gap-3"
          >
            {requestIds.map((id) => (
              <input key={id} type="hidden" name="id" value={id} />
            ))}
            <Label>Technician</Label>
            {candidates.map((candidate, index) => (
              <Candidate
                key={candidate.id}
                candidate={candidate}
                best={index === 0}
                picked={index === picked}
                onPick={() => setPicked(index)}
              />
            ))}
          </form>
        )}
      </Slideout>
      <Toast message={result?.ok ? result.message : null} />
    </>
  );
}

// The mockup gives every candidate the same card and lets the ranking speak:
// the best match is the one that opens out with how full their day is.
function Candidate({ candidate, best, picked, onPick }) {
  const pct = Math.min(100, (candidate.load / candidate.capacity) * 100);

  return (
    <label
      className={[
        "flex cursor-pointer flex-col gap-2.5 rounded-md p-4 transition-colors",
        best
          ? "border-[1.5px] border-brand bg-brand-tint"
          : "border border-border bg-surface hover:bg-page",
        picked ? "shadow-focus" : "",
      ].join(" ")}
    >
      <input
        type="radio"
        name="assigneeId"
        value={candidate.id}
        checked={picked}
        onChange={onPick}
        className="sr-only"
      />
      <div className="flex items-center gap-3">
        <Initials
          name={candidate.name}
          size={40}
          tone={best ? "brand" : "sand"}
        />
        <div className="min-w-0 flex-1">
          <div className="truncate text-base font-bold text-ink">
            {candidate.name}
          </div>
          {best && (
            <div className="text-[13px] font-bold text-brand">Best match</div>
          )}
        </div>
      </div>

      <p
        className={[
          "text-sm",
          candidate.atCapacity ? "text-danger" : "text-ink-soft",
        ].join(" ")}
      >
        {reason(candidate)}
      </p>

      {best && (
        <div className="flex items-center gap-2.5">
          <div className="h-2 flex-1 overflow-hidden rounded-pill bg-surface">
            {/* Fill is data-driven, so width has to be an inline style. */}
            <div
              className={[
                "h-full rounded-pill",
                candidate.atCapacity
                  ? "bg-danger"
                  : pct > 70
                    ? "bg-warning"
                    : "bg-success",
              ].join(" ")}
              style={{ width: `${pct}%` }}
            />
          </div>
          <span className="shrink-0 text-[13px] text-ink-soft">
            {candidate.load} / {candidate.capacity} jobs
          </span>
        </div>
      )}
    </label>
  );
}
