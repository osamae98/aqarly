import Link from "next/link";
import Badge from "@aqarly/ui/Badge";
import {
  categoryLabels,
  formatCharge,
  formatDate,
  stageLabels,
  stageTones,
} from "@aqarly/core/operations";

// One open booking on a unit page. Unassigned work gets the danger tone, since
// what nobody has picked up is how pressure reads here — never a clock.
export default function BookingCard({ request }) {
  const unassigned = !request.assignee;

  const fields = [
    { label: "Ref", value: request.id, className: "font-mono text-[12.5px] text-ink-soft" },
    { label: "Service", value: categoryLabels[request.category] ?? request.category },
    {
      label: "Scheduled",
      value: request.schedule
        ? `${formatDate(request.schedule.date)} · ${request.schedule.slot}`
        : "Not scheduled",
    },
    {
      label: "Housekeeper",
      value: request.assignee?.name ?? "Unassigned",
      className: unassigned ? "font-semibold text-danger" : null,
    },
    { label: "Tenant", value: request.tenant?.name ?? "—" },
    {
      label: "Charge",
      value: request.charge ? `${formatCharge(request.charge)} · tenant` : "—",
      className: "font-mono text-[13px] text-ink",
    },
  ];

  return (
    <Link
      href={`/requests/${request.id}`}
      className="flex flex-col gap-4 rounded-lg border border-border bg-surface p-5 transition-colors hover:border-brand md:p-6"
    >
      <div className="flex items-start justify-between gap-3">
        <h3 className="text-base leading-snug font-bold text-ink">{request.summary}</h3>
        <Badge tone={unassigned ? "danger" : stageTones[request.stage]} dot={false}>
          {unassigned ? "Unassigned" : stageLabels[request.stage]}
        </Badge>
      </div>

      <dl className="grid grid-cols-3 gap-x-4 gap-y-4 border-t border-sunken pt-4">
        {fields.map((field) => (
          <div key={field.label} className="min-w-0">
            <dt className="text-[11px] font-bold tracking-[0.08em] uppercase text-ink-muted">
              {field.label}
            </dt>
            <dd
              className={`mt-1 text-[14px] leading-snug break-words ${field.className || "text-ink"}`}
            >
              {field.value}
            </dd>
          </div>
        ))}
      </dl>
    </Link>
  );
}
