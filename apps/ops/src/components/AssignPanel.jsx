"use client";

import { useState } from "react";
import Slideout from "@aqarly/ui/Slideout";
import Initials from "@/components/Initials";
import { MicroLabel } from "@/components/Panel";
import { typeLabels } from "@aqarly/core/operations";

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
  eyebrow,
  title,
  description,
  note,
}) {
  const [picked, setPicked] = useState(0);
  const choice = candidates[picked];

  return (
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

          {/* Same rule the tenant portal's forms follow: the flow is designed
           * and navigable, but nothing here writes, and the screen says so. */}
          <p className="text-xs text-ink-muted">
            Assignment needs a write path. This portal is read-only until one
            exists, so nothing is sent and no one is notified.
          </p>

          <button
            type="button"
            disabled
            className="w-full cursor-not-allowed rounded-pill bg-brand py-3.5 text-[15px] font-semibold text-ink-inverse opacity-45"
          >
            {choice
              ? `Assign to ${choice.name.split(" ")[0]} · notify tenant`
              : "Assign"}
          </button>
          <button
            type="button"
            disabled
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
        <div className="flex flex-col gap-2.5">
          {candidates.map((candidate, index) =>
            index === picked ? (
              <Best
                key={candidate.id}
                candidate={candidate}
                first={index === 0}
              />
            ) : (
              <button
                key={candidate.id}
                type="button"
                onClick={() => setPicked(index)}
                className="flex cursor-pointer items-center gap-2.5 rounded-md border border-border p-3 text-start transition-colors hover:bg-page"
              >
                <Initials name={candidate.name} size={34} />
                <span className="min-w-0 flex-1">
                  <span
                    className={[
                      "block truncate text-sm font-semibold",
                      candidate.atCapacity ? "text-ink-muted" : "text-ink",
                    ].join(" ")}
                  >
                    {candidate.name}
                  </span>
                  <span
                    className={[
                      "block text-xs",
                      candidate.atCapacity ? "text-danger" : "text-ink-soft",
                    ].join(" ")}
                  >
                    {reason(candidate)}
                  </span>
                </span>
              </button>
            ),
          )}
        </div>
      )}
    </Slideout>
  );
}

// The chosen candidate opens out: avatar, why, and how full their day is.
function Best({ candidate, first }) {
  const pct = Math.min(100, (candidate.load / candidate.capacity) * 100);

  return (
    <div className="flex flex-col gap-2.5 rounded-md border-[1.5px] border-brand bg-brand-tint p-4">
      <div className="flex items-center gap-3">
        <Initials name={candidate.name} size={40} tone="brand" />
        <div className="min-w-0 flex-1">
          <div className="truncate text-[15px] font-bold text-ink">
            {candidate.name}
          </div>
          <div className="text-[12.5px] font-semibold text-brand">
            {candidate.atCapacity
              ? "Over capacity"
              : first
                ? "Best match"
                : "Selected"}
          </div>
        </div>
        {candidate.inBuilding && (
          <span className="shrink-0 rounded-pill bg-brand-tint-strong px-2.5 py-0.5 text-[11.5px] font-bold text-brand">
            On site
          </span>
        )}
      </div>

      <p className="text-[13px] text-ink-soft">{reason(candidate)}</p>

      <div className="flex items-center gap-2.5">
        <div className="h-1.5 flex-1 overflow-hidden rounded-pill bg-surface">
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
        <span className="font-mono text-[11.5px] text-ink-soft">
          {candidate.load} / {candidate.capacity} jobs
        </span>
      </div>
    </div>
  );
}
