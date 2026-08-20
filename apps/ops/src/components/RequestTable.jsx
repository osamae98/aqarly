import Link from "next/link";
import Badge from "@aqarly/ui/Badge";
import {
  categoryLabels,
  formatAge,
  formatCharge,
  slaLabels,
  slaTones,
  stageLabels,
  stageTones,
} from "@aqarly/core/operations";

export default function RequestTable({ requests }) {
  if (!requests.length) {
    return (
      <div className="rounded-lg border border-border bg-surface p-8 text-center">
        <p className="text-sm text-ink-soft">No requests match these filters.</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-border bg-surface shadow-sm">
      <table className="w-full min-w-3xl border-collapse text-sm">
        <thead>
          <tr className="border-b border-border text-left text-xs text-ink-soft">
            <th className="p-4 font-medium">Request</th>
            <th className="p-4 font-medium">Unit</th>
            <th className="p-4 font-medium">Stage</th>
            <th className="p-4 font-medium">SLA</th>
            <th className="p-4 font-medium">Assignee</th>
            <th className="p-4 text-right font-medium">Age</th>
            <th className="p-4 text-right font-medium">Charge</th>
          </tr>
        </thead>
        <tbody>
          {requests.map((request) => (
            <tr
              key={request.id}
              className="border-b border-border last:border-b-0 hover:bg-sunken"
            >
              <td className="p-4">
                <Link href={`/requests/${request.id}`} className="block">
                  <div className="font-medium text-ink">{request.summary}</div>
                  <div className="mt-1 flex items-center gap-2 text-xs text-ink-muted">
                    <span>{request.id}</span>
                    <Badge tone={request.type}>
                      {categoryLabels[request.category] ?? request.category}
                    </Badge>
                    {request.priority === "urgent" && (
                      <Badge tone="danger">Urgent</Badge>
                    )}
                  </div>
                </Link>
              </td>
              <td className="p-4 whitespace-nowrap text-ink-soft">
                <div className="text-ink">{request.unit?.label ?? "—"}</div>
                <div className="text-xs text-ink-muted">
                  {request.property?.name ?? "—"}
                </div>
              </td>
              <td className="p-4">
                <Badge tone={stageTones[request.stage]}>
                  {stageLabels[request.stage]}
                </Badge>
              </td>
              <td className="p-4">
                <Badge tone={slaTones[request.sla.state]}>
                  {slaLabels[request.sla.state]}
                </Badge>
              </td>
              <td className="p-4 whitespace-nowrap text-ink-soft">
                {request.assignee?.name ?? (
                  <span className="text-ink-muted">Unassigned</span>
                )}
              </td>
              <td className="p-4 text-right whitespace-nowrap text-ink-soft">
                {formatAge(request.ageHours)}
              </td>
              <td className="p-4 text-right whitespace-nowrap text-ink-soft">
                {formatCharge(request.charge)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
