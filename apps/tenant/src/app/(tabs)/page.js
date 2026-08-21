import Link from "next/link";
import Badge from "@aqarly/ui/Badge";
import Button from "@aqarly/ui/Button";
import {
  categoryLabels,
  formatCharge,
  formatDateTime,
  getRequests,
  getSignedInTenant,
  stageLabels,
  stageTones,
} from "@aqarly/core/operations";

export default async function MyRequestsPage() {
  const tenant = await getSignedInTenant();
  const requests = await getRequests({ tenantId: tenant.id, sort: "newest" });

  const open = requests.filter((r) => r.stage !== "done");
  const past = requests.filter((r) => r.stage === "done");

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-semibold tracking-tight text-ink">
          {tenant.property?.name} · Unit {tenant.unit?.label}
        </h1>
        <p className="mt-1 text-sm text-ink-soft">{tenant.name}</p>
      </div>

      <Button href="/requests/new" fullWidth>
        New request
      </Button>

      <RequestList title="Active" requests={open} emptyText="No open requests." />
      <RequestList title="Past" requests={past} emptyText="Nothing yet." />
    </div>
  );
}

function RequestList({ title, requests, emptyText }) {
  return (
    <section>
      <h2 className="mb-3 text-sm font-semibold text-ink-soft">{title}</h2>
      {requests.length ? (
        <ul className="flex flex-col gap-3">
          {requests.map((request) => (
            <li key={request.id}>
              <Link
                href={`/requests/${request.id}`}
                className="block rounded-lg border border-border bg-surface p-4 shadow-sm transition-colors hover:bg-sunken"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="font-medium text-ink">{request.summary}</div>
                    <div className="mt-1 text-xs text-ink-muted">
                      {categoryLabels[request.category] ?? request.category} ·{" "}
                      {formatDateTime(request.createdAt)}
                    </div>
                  </div>
                  <Badge tone={stageTones[request.stage]}>
                    {stageLabels[request.stage]}
                  </Badge>
                </div>
                {request.charge && (
                  <div className="mt-3 border-t border-border pt-3 text-sm text-ink-soft">
                    Charge{" "}
                    <span className="font-medium text-ink">
                      {formatCharge(request.charge)}
                    </span>
                  </div>
                )}
              </Link>
            </li>
          ))}
        </ul>
      ) : (
        <p className="rounded-lg border border-border bg-surface p-4 text-sm text-ink-muted">
          {emptyText}
        </p>
      )}
    </section>
  );
}
