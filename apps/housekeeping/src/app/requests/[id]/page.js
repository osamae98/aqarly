import Link from "next/link";
import { notFound } from "next/navigation";
import Badge from "@aqarly/ui/Badge";
import ActivityLog from "@/components/ActivityLog";
import AssignAction from "@/components/AssignAction";
import { MicroLabel } from "@/components/Panel";
import PhotoCarousel from "@/components/PhotoCarousel";
import {
  categoryLabels,
  formatCharge,
  formatDate,
  getAssignmentCandidates,
  getRequestById,
  getRequestNeighbours,
  getUnitById,
  stageLabels,
  stageTones,
} from "@aqarly/core/operations";

export async function generateMetadata({ params }) {
  const { id } = await params;
  const request = await getRequestById(id);
  return { title: request ? `${request.id} — ${request.summary}` : "Booking" };
}

export default async function RequestDetailPage({ params }) {
  const { id } = await params;
  const request = await getRequestById(id);

  // The housekeeping portal is housekeeping-only — a maintenance request has
  // nothing to show here.
  if (!request || request.type !== "housekeeping") notFound();

  const [unit, candidates, neighbours] = await Promise.all([
    getUnitById(request.unitId, { type: "housekeeping" }),
    getAssignmentCandidates(request),
    getRequestNeighbours(request.id, { type: "housekeeping" }),
  ]);

  const categoryLabel = categoryLabels[request.category] ?? request.category;

  return (
    <>
      <div className="flex flex-wrap items-center gap-3 border-b border-border bg-surface px-4 py-3.5 md:px-6">
        <nav
          aria-label="Breadcrumb"
          className="flex min-w-0 items-center gap-2 text-[13px]"
        >
          <Link href="/requests" className="text-ink-muted hover:text-brand">
            Bookings
          </Link>
          <span className="text-border-strong">/</span>
          <Link
            href={`/requests?propertyId=${request.property?.id ?? ""}`}
            className="truncate text-ink-muted hover:text-brand"
          >
            {request.property?.name ?? "Unknown building"}
          </Link>
          <span className="text-border-strong">/</span>
          <span className="font-mono font-semibold text-ink">{request.id}</span>
        </nav>

        <span className="flex-1" />

        <div className="flex items-center gap-2">
          <PageStep href={neighbours.previous && `/requests/${neighbours.previous.id}`}>
            Previous
          </PageStep>
          <PageStep href={neighbours.next && `/requests/${neighbours.next.id}`}>
            Next
          </PageStep>
          {neighbours.total > 0 && (
            <span className="hidden font-mono text-xs text-ink-muted sm:block">
              {neighbours.position} / {neighbours.total}
            </span>
          )}
          <span className="mx-0.5 h-5.5 w-px bg-border" />
          <AssignAction
            requestId={request.id}
            candidates={candidates}
            assigned={Boolean(request.assignee)}
          />
        </div>
      </div>

      <div className="flex flex-col gap-5 p-4 md:p-6">
        <div className="flex flex-col gap-2">
          <p className="font-mono text-[11px] font-bold tracking-[0.09em] text-category-housekeeping uppercase">
            Housekeeping · {categoryLabel}
          </p>
          <div className="flex flex-wrap items-center gap-2.5">
            <h1 className="text-[27px] leading-tight font-bold tracking-[-0.015em] text-ink">
              {request.summary}
            </h1>
            <Badge tone={stageTones[request.stage]} dot={false}>
              {request.assignee ? stageLabels[request.stage] : "Unassigned"}
            </Badge>
          </div>
        </div>

        {/* What the tenant actually said, in their words. */}
        <div className="rounded-md border border-border bg-surface p-4.5">
          <p className="text-[15px] leading-relaxed text-ink">
            {request.description ? (
              `“${request.description}”`
            ) : (
              <span className="text-ink-muted">
                No description was given when this was booked.
              </span>
            )}
          </p>
          <PhotoCarousel photos={request.photos} />
        </div>

        {/* The facts that used to be three panels, condensed into one strip
          * — cheap to scan on one line, with a second, quieter line under
          * each figure carrying what used to need its own card. */}
        <div className="grid divide-y divide-border overflow-hidden rounded-md border border-border bg-surface sm:grid-cols-5 sm:divide-x sm:divide-y-0">
          <StripCell
            label="Unit"
            value={unit ? `${unit.label} · ${unit.bedrooms} BR` : request.unit?.label}
            sub={request.property?.name}
          />
          <StripCell
            label="Tenant"
            value={request.tenant?.name}
            sub={request.tenant?.phone}
          />
          <StripCell
            label="Assignee"
            value={request.assignee?.name ?? "Unassigned"}
            sub={request.assignee ? stageLabels[request.stage] : null}
          />
          <StripCell
            label="Scheduled"
            value={
              request.schedule ? formatDate(request.schedule.date) : "Not scheduled"
            }
            sub={request.schedule?.slot}
          />
          {/* Kept at the price it was booked at, whatever the rate card says
            * now. */}
          <StripCell
            label="Charge"
            value={formatCharge(request.charge)}
            sub={
              request.charge
                ? request.stage === "done"
                  ? "Billed to tenant"
                  : "Billed to tenant on completion"
                : null
            }
          />
        </div>

        <section className="flex flex-col gap-2">
          <MicroLabel>Activity</MicroLabel>
          <ActivityLog request={request} />
        </section>
      </div>
    </>
  );
}

function PageStep({ href, children }) {
  const classes =
    "rounded-pill border border-border-strong px-3.5 py-2 text-[13px] font-semibold";

  return href ? (
    <Link href={href} className={`${classes} text-ink-soft hover:bg-sunken`}>
      {children}
    </Link>
  ) : (
    <span className={`${classes} text-ink-muted opacity-45`}>{children}</span>
  );
}

// One column of the condensed facts strip: a label, a headline figure, and
// a quieter second line for what used to need its own panel.
function StripCell({ label, value, sub, flagged = false }) {
  return (
    <div className="flex min-w-0 flex-col gap-1 px-4 py-3">
      <span className="text-[11px] font-bold tracking-[0.1em] uppercase text-ink-muted">
        {label}
      </span>
      <span className="flex items-center gap-1.5 truncate text-[13.5px] font-semibold text-ink">
        {flagged && <span className="size-1.5 shrink-0 rounded-pill bg-danger" />}
        {value || "—"}
      </span>
      {sub && (
        <span className="truncate text-[12px] text-ink-muted">{sub}</span>
      )}
    </div>
  );
}
