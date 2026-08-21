import { formatDateTime, stageLabels, stages } from "@aqarly/core/operations";
import { Check, Clock, Send, UserCheck } from "./icons";

// The tenant design tracks progress with labelled icon tiles rather than the
// compact dots of `@aqarly/ui/Timeline` (which the ops queue uses), so this
// stays app-local until a second product asks for the same treatment.
const stageIcons = {
  submitted: Send,
  assigned: UserCheck,
  "in-progress": Clock,
  done: Check,
};

function caption(request, stage, at, isLast) {
  if (!at) return isLast ? "Waiting for completion" : "Waiting";

  const named = stage !== "submitted" && request.assignee;
  return named
    ? `${formatDateTime(at)} — ${request.assignee.name}`
    : formatDateTime(at);
}

export default function RequestTimeline({ request }) {
  const reached = new Map(
    request.stageHistory.map((entry) => [entry.stage, entry.at]),
  );
  const currentIndex = stages.indexOf(request.stage);

  return (
    <ol className="flex flex-col">
      {stages.map((stage, index) => {
        const Icon = stageIcons[stage];
        const at = reached.get(stage) ?? null;
        const isCurrent = index === currentIndex;
        const isPast = index < currentIndex;
        const isLast = index === stages.length - 1;

        const tile = isCurrent
          ? "bg-brand text-ink-inverse ring-4 ring-brand-tint"
          : isPast
            ? "bg-success-tint text-success"
            : "border border-border bg-sunken text-ink-muted";

        const connector =
          index + 1 < currentIndex
            ? "bg-success"
            : index + 1 === currentIndex
              ? "bg-brand"
              : "bg-border";

        return (
          <li key={stage} className="flex gap-3">
            <div className="flex flex-col items-center">
              <span
                className={`flex size-8 shrink-0 items-center justify-center rounded-md ${tile}`}
              >
                <Icon size={17} />
              </span>
              {!isLast && <span className={`w-0.5 flex-1 ${connector}`} />}
            </div>
            <div className={isLast ? "" : "pb-5"}>
              <p
                className={`text-sm font-semibold ${at || isCurrent ? "text-ink" : "text-ink-soft"}`}
              >
                {stageLabels[stage]}
              </p>
              <p className="mt-1 text-xs text-ink-muted">
                {caption(request, stage, at, isLast)}
              </p>
            </div>
          </li>
        );
      })}
    </ol>
  );
}
