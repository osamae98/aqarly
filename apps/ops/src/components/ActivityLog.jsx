import { formatDateTime, stageLabels } from "@aqarly/core/operations";

// The request's own stage history, newest first — the same events the tenant
// portal turns into notifications, read from the ops side.
const copy = {
  submitted: (request) =>
    request.origin === "ops"
      ? "Raised in the ops portal"
      : "Submitted via the tenant portal",
  assigned: (request) =>
    request.assignee ? `Assigned to ${request.assignee.name}` : "Assigned",
  "in-progress": (request) =>
    request.assignee ? `${request.assignee.name} started work` : "Work started",
  done: (request) => request.completionNotes ?? "Marked complete",
};

export default function ActivityLog({ request }) {
  const entries = [...request.stageHistory].reverse();

  return (
    <ol className="flex flex-col">
      {entries.map((entry) => (
        <li
          key={`${entry.stage}-${entry.at}`}
          className="flex flex-col gap-1 border-b border-border py-2.5 last:border-b-0 sm:flex-row sm:gap-3"
        >
          <span className="w-44 shrink-0 font-mono text-[12.5px] text-ink-muted">
            {formatDateTime(entry.at)}
          </span>
          <span className="text-[13.5px] text-ink">
            {(copy[entry.stage] ?? (() => stageLabels[entry.stage]))(request)}
          </span>
        </li>
      ))}
    </ol>
  );
}
