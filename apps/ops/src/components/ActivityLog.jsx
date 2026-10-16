import Icon from "@aqarly/ui/Icon";
import { formatDateTime } from "@aqarly/core/labels";
import PhotoCarousel from "@/components/PhotoCarousel";

// The request's history as a timeline, newest first: one step per stage it
// reached, each with its own icon and color, plus a hand-back if a
// technician gave the job back. What people wrote (the closing note, the
// hand-back reason) sits in a box under its step, with the photos the job
// was closed with.
const steps = {
  submitted: {
    icon: "file-text",
    tone: "bg-stage-submitted-tint text-stage-submitted",
    // Older requests don't record who raised them; like the rest of the
    // portal, anything not raised by ops counts as the tenant's.
    title: (request) =>
      request.origin === "ops"
        ? "Raised by ops"
        : request.tenant
          ? `Raised by ${request.tenant.name}`
          : "Raised by the tenant",
  },
  assigned: {
    icon: "user",
    tone: "bg-stage-assigned-tint text-stage-assigned",
    title: (request) =>
      request.assignee ? `Assigned to ${request.assignee.name}` : "Assigned",
  },
  "in-progress": {
    icon: "wrench",
    tone: "bg-stage-in-progress-tint text-stage-in-progress",
    title: (request) =>
      request.assignee ? `${request.assignee.name} started work` : "Work started",
  },
  done: {
    icon: "check",
    tone: "bg-stage-done-tint text-stage-done",
    title: (request) =>
      request.assignee ? `Done by ${request.assignee.name}` : "Done",
    note: (request) => request.completionNotes,
    photos: (request) => request.completionPhotos,
  },
  // Not a stage: a technician handing the job back through the field app.
  // It leaves the request unassigned, so without its own step the history
  // would show an assignment that simply vanished.
  "handed-back": {
    icon: "alert-triangle",
    tone: "bg-warning-tint text-warning-ink",
    noteTone: "border-[var(--amber-300)] bg-warning-tint text-warning-ink",
    title: (request) =>
      `Handed back by ${request.handBack?.byName ?? "a technician"}`,
    note: (request) => request.handBack?.reason,
  },
};

export default function ActivityLog({ request }) {
  // The hand-back is recorded beside the history rather than in it, since
  // it is the request leaving a stage rather than reaching one. Merged here
  // and sorted by time so the timeline reads as one sequence.
  const entries = [
    ...request.stageHistory,
    ...(request.handBack ? [{ stage: "handed-back", at: request.handBack.at }] : []),
  ]
    .filter((entry) => steps[entry.stage])
    .sort((a, b) => new Date(b.at) - new Date(a.at));

  return (
    <ol className="flex flex-col">
      {entries.map((entry, index) => {
        const step = steps[entry.stage];
        const note = step.note?.(request);
        const photos = step.photos?.(request) ?? [];
        const last = index === entries.length - 1;

        return (
          <li key={`${entry.stage}-${entry.at}`} className="relative flex gap-3.5 pb-5 last:pb-0">
            {/* The line joining this step to the one below it. */}
            {!last && (
              <span aria-hidden className="absolute start-[15px] top-8 bottom-0 w-px bg-border" />
            )}
            <span
              className={`relative flex size-8 shrink-0 items-center justify-center rounded-pill ${step.tone}`}
            >
              <Icon name={step.icon} size={15} />
            </span>

            <div className="flex min-w-0 flex-1 flex-col gap-1 pt-1">
              <p className="text-[14px] font-semibold text-ink">{step.title(request)}</p>
              <p className="text-[12.5px] text-ink-muted">{formatDateTime(entry.at)}</p>

              {note && (
                <p
                  className={`mt-1.5 rounded-md border px-3.5 py-2.5 text-[13.5px] leading-relaxed ${
                    step.noteTone ?? "border-border bg-surface text-ink-soft"
                  }`}
                >
                  {note}
                </p>
              )}

              {photos.length > 0 && <PhotoCarousel photos={photos} />}
            </div>
          </li>
        );
      })}
    </ol>
  );
}
