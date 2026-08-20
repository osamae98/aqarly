import Link from "next/link";
import { notFound } from "next/navigation";
import Badge from "@aqarly/ui/Badge";
import Card from "@aqarly/ui/Card";
import Timeline from "@aqarly/ui/Timeline";
import {
  categoryLabels,
  formatCharge,
  formatDateTime,
  getRequestById,
  getSignedInTenant,
  stageLabels,
  stageSteps,
  stageTones,
} from "@aqarly/core/operations";

export async function generateMetadata({ params }) {
  const { id } = await params;
  const request = await getRequestById(id);
  return { title: request?.summary ?? "Request" };
}

export default async function TenantRequestPage({ params }) {
  const { id } = await params;
  const [request, tenant] = await Promise.all([
    getRequestById(id),
    getSignedInTenant(),
  ]);

  // A tenant may only ever see their own unit's requests — the PRD makes this
  // a hard requirement, so it is enforced here rather than by hiding links.
  if (!request || request.tenantId !== tenant.id) notFound();

  return (
    <div className="flex flex-col gap-6">
      <div>
        <Link
          href="/"
          className="text-sm text-ink-soft transition-colors hover:text-brand"
        >
          ← All requests
        </Link>
        <div className="mt-3">
          <Badge tone={stageTones[request.stage]}>
            {stageLabels[request.stage]}
          </Badge>
        </div>
        <h1 className="mt-3 text-xl font-semibold tracking-tight text-ink">
          {request.summary}
        </h1>
        <p className="mt-1 text-sm text-ink-muted">
          {categoryLabels[request.category] ?? request.category} · submitted{" "}
          {formatDateTime(request.createdAt)}
        </p>
      </div>

      <Card title="Progress">
        <Timeline steps={stageSteps(request)} />
      </Card>

      <Card title="What you told us">
        <p className="text-sm text-ink-soft">{request.description}</p>
      </Card>

      {request.completionNotes && (
        <Card title="What was done">
          <p className="text-sm text-ink-soft">{request.completionNotes}</p>
        </Card>
      )}

      {request.charge && (
        <Card title="Charge">
          <div className="flex items-baseline justify-between">
            <span className="text-sm text-ink-soft">
              {categoryLabels[request.category]}
            </span>
            <span className="text-lg font-semibold text-ink">
              {formatCharge(request.charge)}
            </span>
          </div>
          <p className="mt-2 text-xs text-ink-muted">
            Confirmed at the rate shown when you booked.
          </p>
        </Card>
      )}
    </div>
  );
}
