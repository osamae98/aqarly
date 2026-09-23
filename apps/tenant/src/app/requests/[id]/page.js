import { notFound } from "next/navigation";
import {
  categoryLabels,
  formatCharge,
  formatDateTime,
  getRequestById,
  getSignedInTenant,
} from "@aqarly/core/operations";
import RequestTimeline from "@/components/RequestTimeline";
import Screen from "@/components/Screen";
import SectionLabel from "@/components/SectionLabel";
import TypeTag from "@/components/TypeTag";

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

  const doneAt = request.stageHistory.find((entry) => entry.stage === "done")?.at;

  return (
    <Screen title={request.id} backHref="/">
      <div className="mb-6">
        <TypeTag type={request.type} />
        <h2 className="my-2 text-xl font-bold text-ink">{request.summary}</h2>
        <p className="text-sm text-ink-soft">
          {request.unit ? `Unit ${request.unit.label}` : null}
          {request.unit && request.property ? " · " : null}
          {request.property?.name}
        </p>
      </div>

      <div className="flex flex-col gap-5 md:grid md:grid-cols-2 md:items-start">
        <div className="rounded-md border border-border bg-surface p-5">
          <SectionLabel className="mb-4">Timeline</SectionLabel>
          <RequestTimeline request={request} />
        </div>

        <div className="flex flex-col gap-4">
          {request.description && (
            <Panel title="Your description">{request.description}</Panel>
          )}

          {request.charge && (
            <div className="rounded-md border border-border bg-sunken p-4">
              <p className="mb-2 text-sm font-semibold text-ink">
                Service charge
              </p>
              <p className="text-2xl font-bold text-category-housekeeping">
                {formatCharge(request.charge)}
              </p>
              <p className="mt-2 text-xs text-ink-muted">
                {categoryLabels[request.category] ?? request.category}
                {doneAt ? ` · billed ${formatDateTime(doneAt)}` : null}
              </p>
            </div>
          )}

          {request.completionNotes && (
            <Panel title="Notes from staff">{request.completionNotes}</Panel>
          )}

          {request.photos?.length > 0 && (
            <div className="rounded-md border border-border bg-sunken p-4">
              <p className="mb-3 text-sm font-semibold text-ink">Photos</p>
              <div className="flex flex-wrap gap-2">
                {request.photos.map((photo, index) => (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    key={`${photo.name}-${index}`}
                    src={photo.dataUrl}
                    alt={photo.name}
                    className="size-20 rounded-md border border-border object-cover"
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </Screen>
  );
}

function Panel({ title, children }) {
  return (
    <div className="rounded-md border border-border bg-sunken p-4">
      <p className="mb-2 text-sm font-semibold text-ink">{title}</p>
      <p className="text-sm text-ink-soft">{children}</p>
    </div>
  );
}
