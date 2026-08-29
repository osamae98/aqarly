import Link from "next/link";
import { notFound } from "next/navigation";
import Badge from "@aqarly/ui/Badge";
import ActivityLog from "@/components/ActivityLog";
import AssignAction from "@/components/AssignAction";
import Panel, { MicroLabel } from "@/components/Panel";
import {
  categoryCodes,
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

export async function generateMetadata({ params }) {
  const { id } = await params;
  const request = await getRequestById(id);
  return { title: request ? `${request.id} — ${request.summary}` : "Request" };
}

export default async function RequestDetailPage({ params }) {
  const { id } = await params;
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
  const spentHere = sameCategory.reduce(
    (sum, item) => sum + (item.charge ?? 0),
    0,
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
        <div className="flex items-start gap-4">
          <span
            className={[
              "flex size-12 shrink-0 items-center justify-center rounded-md font-mono text-sm font-bold",
              request.type === "housekeeping"
                ? "bg-category-housekeeping-tint text-category-housekeeping"
                : "bg-category-maintenance-tint text-category-maintenance",
            ].join(" ")}
          >
            {categoryCodes[request.category] ?? "GN"}
          </span>

          <div className="flex min-w-0 flex-1 flex-col gap-2">
            <h1 className="text-[27px] leading-tight font-bold tracking-[-0.015em] text-ink">
              {request.summary}
            </h1>
            <div className="flex flex-wrap items-center gap-2">
              {request.priority === "urgent" && (
                <Badge tone="danger" dot={false}>
                  Emergency
                </Badge>
              )}
              <Badge tone={stageTones[request.stage]} dot={false}>
                {request.assignee ? stageLabels[request.stage] : "Unassigned"}
              </Badge>
              <span className="text-[13.5px] text-ink-soft">
                {request.type === "housekeeping" ? "Housekeeping" : "Maintenance"}{" "}
                · {categoryLabel} · reported {formatDateTime(request.createdAt)}
              </span>
            </div>
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
          <p className="mt-3 text-xs text-ink-muted">
            Photos are part of the designed flow; the tenant portal has no
            upload path yet, so none are attached.
          </p>
        </div>

        <div className="grid gap-3 lg:grid-cols-3">
          <Panel label="Unit & tenant" bodyClassName="flex flex-col gap-2.5">
            <Row label="Unit" value={unit ? `${unit.label} · ${unit.bedrooms} BR · ${unit.bathrooms} bath` : request.unit?.label} />
            <Row label="Building" value={request.property?.name} />
            <Row label="Tenant" value={request.tenant?.name} />
            <Row label="Contact" value={request.tenant?.phone} />
            <Row
              label="Assignee"
              value={request.assignee?.name ?? "Unassigned"}
            />
          </Panel>

          <Panel
            label={`This unit\u2019s ${categoryLabel} history`}
            bodyClassName="flex flex-col gap-2.5"
          >
            <div className="flex items-start gap-2.5">
              <span
                className={[
                  "mt-1.5 size-1.5 shrink-0 rounded-pill",
                  repeat ? "bg-danger" : "bg-border-strong",
                ].join(" ")}
              />
              <p className="text-[13.5px] leading-snug">
                <b className="text-ink">
                  {sameCategory.length === 0
                    ? "First time in this unit"
                    : `${sameCategory.length + 1}${ordinal(sameCategory.length + 1)} ${categoryLabel} call here`}
                </b>
                <br />
                <span className="text-ink-soft">
                  {sameCategory.length
                    ? sameCategory
                        .slice(0, 2)
                        .map((item) => formatDateTime(item.createdAt))
                        .join(" · ")
                    : "Nothing else has been raised like this here."}
                </span>
              </p>
            </div>
            {repeat && (
              <p className="rounded-sm bg-warning-tint p-2.5 text-[13px] font-medium text-warning-ink">
                {repeatFaultRule.occurrences} or more visits inside{" "}
                {Math.round(repeatFaultRule.withinDays / 30)} months. Consider
                replacement over another repair.
              </p>
            )}
          </Panel>

          <Panel
            label="Cost to date"
            className="flex flex-col"
            bodyClassName="flex flex-1 flex-col gap-2.5"
          >
            <div className="font-mono text-2xl font-bold tracking-[-0.01em] text-ink">
              {unit?.lifetimeSpend
                ? formatCharge(unit.lifetimeSpend)
                : "Nothing yet"}
            </div>
            <p className="text-[13px] text-ink-soft">
              {spentHere
                ? `${formatCharge(spentHere)} of it on ${categoryLabel}, across ${sameCategory.length} prior ${sameCategory.length === 1 ? "visit" : "visits"}`
                : `No ${categoryLabel} work has been charged against this unit`}
            </p>
            <div className="mt-auto flex flex-col gap-2.5 pt-2">
              <Row label="This request" value={formatCharge(request.charge)} />
              <Row
                label="Billed to"
                value={request.type === "housekeeping" ? "Tenant" : "Landlord"}
              />
            </div>
          </Panel>
        </div>

        <section className="flex flex-col gap-2">
          <MicroLabel>Activity</MicroLabel>
          <ActivityLog request={request} />
        </section>

        <section className="flex flex-col gap-2">
          <div className="flex items-baseline gap-3">
            <MicroLabel>Rest of this unit&rsquo;s history</MicroLabel>
            <span className="flex-1" />
            {unit && (
              <Link
                href={`/units/${unit.id}`}
                className="text-[13px] font-semibold text-brand hover:underline"
              >
                Open the unit record →
              </Link>
            )}
          </div>

          {history.length ? (
            <ul className="flex flex-col">
              {history.slice(0, 5).map((item) => (
                <li key={item.id} className="border-b border-border last:border-b-0">
                  <Link
                    href={`/requests/${item.id}`}
                    className="flex items-center gap-3.5 py-2.5 transition-colors hover:text-brand"
                  >
                    <span className="w-28 shrink-0 font-mono text-[12.5px] whitespace-nowrap text-ink-muted">
                      {formatDate(item.createdAt)}
                    </span>
                    <span className="min-w-0 flex-1 truncate text-[13.5px] text-ink">
                      {item.summary}
                    </span>
                    <span className="shrink-0 text-[12.5px] text-ink-soft">
                      {item.assignee?.name ?? "—"}
                    </span>
                    <span className="w-20 shrink-0 text-end font-mono text-[12.5px] text-ink-soft">
                      {item.stage === "done" ? formatCharge(item.charge) : "open"}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
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

function Row({ label, value }) {
  return (
    <div className="flex justify-between gap-4 text-sm">
      <span className="text-ink-soft">{label}</span>
      <span className="text-end font-semibold text-ink">{value || "—"}</span>
    </div>
  );
}
