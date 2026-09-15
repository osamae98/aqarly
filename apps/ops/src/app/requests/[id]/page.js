import Link from "next/link";
import { notFound } from "next/navigation";
import Badge from "@aqarly/ui/Badge";
import Tabs from "@aqarly/ui/Tabs";
import ActivityLog from "@/components/ActivityLog";
import AssignAction from "@/components/AssignAction";
import {
  categoryLabels,
  formatCharge,
  formatDate,
  formatDateTime,
  getAssignmentCandidates,
  getRequestById,
  getRequestNeighbours,
  getUnitById,
  getUnitHistory,
  repeatFaultRule,
  stageLabels,
  stageTones,
} from "@aqarly/core/operations";

const HISTORY_GRID =
  "grid grid-cols-[110px_minmax(0,1fr)_140px_90px] items-center gap-3.5";

export async function generateMetadata({ params }) {
  const { id } = await params;
  const request = await getRequestById(id);
  return { title: request ? `${request.id} — ${request.summary}` : "Request" };
}

export default async function RequestDetailPage({ params, searchParams }) {
  const { id } = await params;
  const query = await searchParams;
  const tab = query.tab === "history" ? "history" : "activity";
  const request = await getRequestById(id);

  if (!request) notFound();

  const [history, unit, candidates, neighbours] = await Promise.all([
    getUnitHistory(request.unitId, { excludeId: request.id }),
    getUnitById(request.unitId),
    getAssignmentCandidates(request),
    getRequestNeighbours(request.id),
  ]);

  const sameCategory = history.filter(
    (item) => item.category === request.category,
  );
  const categoryLabel = categoryLabels[request.category] ?? request.category;
  const repeat = unit?.repeatFault?.category === request.category
    ? unit.repeatFault
    : null;

  return (
    <>
      <div className="flex flex-wrap items-center gap-3 border-b border-border bg-surface px-4 py-3.5 md:px-6">
        <nav
          aria-label="Breadcrumb"
          className="flex min-w-0 items-center gap-2 text-[13px]"
        >
          <Link href="/requests" className="text-ink-muted hover:text-brand">
            Requests
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
            note={
              repeat
                ? `Repeat ${categoryLabel} fault — ${repeat.count} visits already. Check before another like-for-like repair.`
                : null
            }
          />
        </div>
      </div>

      <div className="flex flex-col gap-5 p-4 md:p-6">
        <div className="flex flex-col gap-2">
          <p
            className={[
              "font-mono text-[11px] font-bold tracking-[0.09em] uppercase",
              request.type === "housekeeping"
                ? "text-category-housekeeping"
                : "text-category-maintenance",
            ].join(" ")}
          >
            {request.type === "housekeeping" ? "Housekeeping" : "Maintenance"} ·{" "}
            {categoryLabel} · reported {formatDateTime(request.createdAt)}
          </p>
          <div className="flex flex-wrap items-center gap-2.5">
            <h1 className="text-[27px] leading-tight font-bold tracking-[-0.015em] text-ink">
              {request.summary}
            </h1>
            {request.priority === "urgent" && (
              <Badge tone="danger" dot={false}>
                Emergency
              </Badge>
            )}
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
                No description was given when this request was raised.
              </span>
            )}
          </p>
          {request.photos?.length ? (
            <div className="mt-3.5 flex flex-wrap gap-2.5">
              {request.photos.map((photo) => (
                /* Inline data URLs from the upload — nothing for
                 * `next/image` to optimise, and no loader to point at. */
                /* eslint-disable-next-line @next/next/no-img-element */
                <img
                  key={photo.dataUrl}
                  src={photo.dataUrl}
                  alt={photo.name}
                  className="size-28 rounded-sm border border-border object-cover"
                />
              ))}
            </div>
          ) : (
            <p className="mt-3 text-xs text-ink-muted">
              Photos can be attached when a request is raised here; the tenant
              portal has no upload path yet, so none are attached to this one.
            </p>
          )}
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
            label={`${categoryLabel} history`}
            value={
              sameCategory.length === 0
                ? "First time here"
                : `${sameCategory.length + 1}${ordinal(sameCategory.length + 1)} call here`
            }
            sub={
              sameCategory.length
                ? formatDateTime(sameCategory[0].createdAt)
                : "Nothing else raised like this"
            }
            flagged={Boolean(repeat)}
          />
          <StripCell
            label="Cost to date"
            value={unit?.lifetimeSpend ? formatCharge(unit.lifetimeSpend) : "Nothing yet"}
            sub={`${formatCharge(request.charge)} this request · ${
              request.type === "housekeeping" ? "Tenant" : "Landlord"
            }`}
          />
        </div>

        {repeat && (
          <p className="rounded-md bg-warning-tint p-3 text-[13px] font-medium text-warning-ink">
            Repeat fault — {repeatFaultRule.occurrences} or more {categoryLabel}{" "}
            visits inside {Math.round(repeatFaultRule.withinDays / 30)} months.
            Consider replacement over another repair.
          </p>
        )}

        <section className="flex flex-col gap-3">
          <div className="flex flex-wrap items-center gap-3">
            <Tabs
              value={tab}
              tabs={[
                {
                  value: "activity",
                  label: "Activity",
                  count: request.stageHistory.length,
                  href: `/requests/${request.id}`,
                },
                {
                  value: "history",
                  label: "Rest of this unit's history",
                  count: history.length,
                  href: `/requests/${request.id}?tab=history`,
                },
              ]}
            />
            <span className="flex-1" />
            {unit && (
              <Link
                href={`/units/${unit.id}`}
                className="shrink-0 text-[13px] font-semibold text-brand hover:underline"
              >
                Open the unit record →
              </Link>
            )}
          </div>

          {tab === "activity" ? (
            <ActivityLog request={request} />
          ) : history.length ? (
            <div className="overflow-hidden rounded-md border border-border bg-surface">
              <div
                className={`${HISTORY_GRID} border-b border-border px-3 py-2.5 text-[11px] font-bold tracking-[0.1em] uppercase text-ink-muted`}
              >
                <span>Date</span>
                <span>Request</span>
                <span>Assigned to</span>
                <span className="text-end">Cost</span>
              </div>
              <div className="divide-y divide-sunken">
                {history.slice(0, 5).map((item) => (
                  <Link
                    key={item.id}
                    href={`/requests/${item.id}`}
                    className={`${HISTORY_GRID} px-3 py-2.5 transition-colors hover:bg-page`}
                  >
                    <span className="font-mono text-[12.5px] whitespace-nowrap text-ink-muted">
                      {formatDate(item.createdAt)}
                    </span>
                    <span className="min-w-0 truncate text-[13.5px] text-ink">
                      {item.summary}
                    </span>
                    <span className="min-w-0 truncate text-[12.5px] text-ink-soft">
                      {item.assignee?.name ?? "Unassigned"}
                    </span>
                    <span className="text-end font-mono text-[12.5px] text-ink-soft">
                      {item.stage === "done" ? formatCharge(item.charge) : "Open"}
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          ) : (
            <p className="text-sm text-ink-muted">
              Nothing else has been raised for this unit.
            </p>
          )}
        </section>
      </div>
    </>
  );
}

function ordinal(n) {
  if (n % 100 >= 11 && n % 100 <= 13) return "th";
  return ["th", "st", "nd", "rd"][n % 10] ?? "th";
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
