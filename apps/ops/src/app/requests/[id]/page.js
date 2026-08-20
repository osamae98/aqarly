import Link from "next/link";
import { notFound } from "next/navigation";
import Badge from "@aqarly/ui/Badge";
import Card from "@aqarly/ui/Card";
import Timeline from "@aqarly/ui/Timeline";
import {
  categoryLabels,
  formatAge,
  formatCharge,
  formatDateTime,
  getRequestById,
  getUnitHistory,
  slaLabels,
  slaTones,
  stageLabels,
  stageSteps,
  stageTones,
} from "@aqarly/core/operations";

export async function generateMetadata({ params }) {
  const { id } = await params;
  const request = await getRequestById(id);
  return { title: request ? `${request.id} — ${request.summary}` : "Request" };
}

export default async function RequestDetailPage({ params }) {
  const { id } = await params;
  const request = await getRequestById(id);

  if (!request) notFound();

  const history = await getUnitHistory(request.unitId, { excludeId: request.id });

  return (
    <div className="flex flex-col gap-6">
      <div>
        <Link
          href="/requests"
          className="text-sm text-ink-soft transition-colors hover:text-brand"
        >
          ← Back to queue
        </Link>
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <Badge tone={stageTones[request.stage]}>
            {stageLabels[request.stage]}
          </Badge>
          <Badge tone={slaTones[request.sla.state]}>
            SLA {slaLabels[request.sla.state].toLowerCase()}
          </Badge>
          <Badge tone={request.type}>
            {categoryLabels[request.category] ?? request.category}
          </Badge>
          {request.priority === "urgent" && <Badge tone="danger">Urgent</Badge>}
        </div>
        <h1 className="mt-3 text-2xl font-semibold tracking-tight text-ink">
          {request.summary}
        </h1>
        <p className="mt-1 text-sm text-ink-muted">
          {request.id} · opened {formatDateTime(request.createdAt)} ·{" "}
          {formatAge(request.ageHours)} old
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="flex flex-col gap-6 lg:col-span-2">
          <Card title="Request">
            <p className="text-sm text-ink-soft">{request.description}</p>
            {request.completionNotes && (
              <div className="mt-4 rounded-md border-l-4 border-success bg-success-tint p-4">
                <div className="mb-1 text-sm font-semibold text-success">
                  Completion notes
                </div>
                <p className="text-sm text-success">{request.completionNotes}</p>
              </div>
            )}
          </Card>

          <Card
            title="Unit service history"
            description={`Previous requests for unit ${request.unit?.label ?? "—"}`}
          >
            {history.length ? (
              <ul className="flex flex-col divide-y divide-border">
                {history.map((item) => (
                  <li key={item.id} className="py-3 first:pt-0 last:pb-0">
                    <Link
                      href={`/requests/${item.id}`}
                      className="flex items-center justify-between gap-4"
                    >
                      <div className="min-w-0">
                        <div className="truncate text-sm text-ink">
                          {item.summary}
                        </div>
                        <div className="mt-0.5 text-xs text-ink-muted">
                          {formatDateTime(item.createdAt)} ·{" "}
                          {item.assignee?.name ?? "Unassigned"}
                        </div>
                      </div>
                      <div className="flex shrink-0 items-center gap-3">
                        <span className="text-xs text-ink-soft">
                          {formatCharge(item.charge)}
                        </span>
                        <Badge tone={stageTones[item.stage]}>
                          {stageLabels[item.stage]}
                        </Badge>
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-ink-muted">
                No other requests for this unit.
              </p>
            )}
          </Card>
        </div>

        <div className="flex flex-col gap-6">
          <Card title="Progress">
            <Timeline steps={stageSteps(request)} />
          </Card>

          <Card title="Details">
            <dl className="flex flex-col gap-3 text-sm">
              <div className="flex justify-between gap-4">
                <dt className="text-ink-soft">Property</dt>
                <dd className="text-right text-ink">{request.property?.name ?? "—"}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-ink-soft">Unit</dt>
                <dd className="text-right text-ink">{request.unit?.label ?? "—"}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-ink-soft">Tenant</dt>
                <dd className="text-right text-ink">{request.tenant?.name ?? "—"}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-ink-soft">Assignee</dt>
                <dd className="text-right text-ink">
                  {request.assignee?.name ?? "Unassigned"}
                </dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-ink-soft">Charge</dt>
                <dd className="text-right text-ink">{formatCharge(request.charge)}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-ink-soft">SLA target</dt>
                <dd className="text-right text-ink">
                  {formatAge(request.sla.targetHours)}
                </dd>
              </div>
            </dl>
          </Card>
        </div>
      </div>
    </div>
  );
}
