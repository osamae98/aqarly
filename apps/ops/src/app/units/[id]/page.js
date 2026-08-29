import Link from "next/link";
import { notFound } from "next/navigation";
import PageBar from "@/components/PageBar";
import ServiceHistoryRows from "@/components/ServiceHistoryRows";
import Tabs from "@aqarly/ui/Tabs";
import Tag from "@aqarly/ui/Tag";
import {
  categoryLabels,
  formatCharge,
  formatDate,
  getRequests,
  getUnitById,
  repeatFaultRule,
} from "@aqarly/core/operations";

export async function generateMetadata({ params }) {
  const { id } = await params;
  const unit = await getUnitById(id);
  return { title: unit ? `Unit ${unit.label}` : "Unit" };
}

export default async function UnitDetailPage({ params, searchParams }) {
  const { id } = await params;
  const query = await searchParams;
  const unit = await getUnitById(id);

  if (!unit) notFound();

  const all = await getRequests({ unitId: id, sort: "newest" });

  const tab = query.tab === "charges" ? "charges" : "history";
  const categories = [...new Set(all.map((request) => request.category))];
  const category = categories.includes(query.category) ? query.category : null;

  const scoped = all
    .filter((request) => !category || request.category === category)
    .filter((request) => tab !== "charges" || request.charge);

  const onCategory = unit.repeatFault
    ? all
        .filter((r) => r.category === unit.repeatFault.category)
        .reduce((sum, r) => sum + (r.charge ?? 0), 0)
    : 0;

  return (
    <>
      <PageBar
        eyebrow={
          <span className="flex items-center gap-1.5">
            <Link href="/units" className="hover:text-brand">
              Units
            </Link>
            <span className="text-border-strong">/</span>
            <Link
              href={`/units?propertyId=${unit.propertyId}`}
              className="hover:text-brand"
            >
              {unit.property?.name}
            </Link>
            <span className="text-border-strong">/</span>
            <span className="font-mono">{unit.label}</span>
          </span>
        }
        title={`Unit ${unit.label} · ${unit.property?.name ?? ""}`}
        meta={`${unit.bedrooms} BR · ${unit.bathrooms} bath · ${unit.tenant?.name ?? "no tenant"}`}
        stats={
          <div className="flex gap-6">
            <HeadStat value={unit.requestCount} label="requests on record" />
            <HeadStat
              value={formatCharge(unit.lifetimeSpend)}
              label="lifetime spend"
            />
            {unit.repeatFault && (
              <HeadStat
                value={formatCharge(onCategory)}
                label={`on ${categoryLabels[unit.repeatFault.category] ?? ""} alone`}
                tone="danger"
              />
            )}
          </div>
        }
      />

      <div className="flex flex-col gap-4 p-4 md:p-6">
        {/* The repair-versus-replace signal, stated before the history rather
         * than left to be counted out of it. */}
        {unit.repeatFault && (
          <div className="flex flex-wrap items-center gap-3.5 rounded-md border border-[var(--amber-300)] bg-warning-tint px-4.5 py-3.5">
            <div className="min-w-0 flex-1">
              <p className="text-[15px] font-bold text-warning-ink">
                Repeat-fault flag —{" "}
                {categoryLabels[unit.repeatFault.category] ??
                  unit.repeatFault.category}{" "}
                serviced {unit.repeatFault.count} times
              </p>
              <p className="text-[13px] text-warning-ink">
                {repeatFaultRule.occurrences} or more visits inside{" "}
                {Math.round(repeatFaultRule.withinDays / 30)} months, costing{" "}
                {formatCharge(unit.repeatFault.spend)}. Price a replacement
                before booking another repair.
              </p>
            </div>
            <span
              title="Raising work needs a write path"
              className="cursor-not-allowed rounded-pill bg-brand px-4 py-2.5 text-[13.5px] font-semibold text-ink-inverse opacity-45"
            >
              Raise replacement request
            </span>
          </div>
        )}

        <div className="flex flex-wrap items-end justify-between gap-3 border-b border-border">
          <Tabs
            value={tab}
            tabs={[
              {
                value: "history",
                label: "Service history",
                count: all.length,
                href: `/units/${unit.id}${category ? `?category=${category}` : ""}`,
              },
              {
                value: "charges",
                label: "Charges",
                count: all.filter((r) => r.charge).length,
                href: `/units/${unit.id}?tab=charges${category ? `&category=${category}` : ""}`,
              },
            ]}
          />

          {categories.length > 1 && (
            <div className="flex flex-wrap gap-2 pb-2.5">
              {categories.map((key) => (
                <Tag
                  key={key}
                  size="sm"
                  selected={category === key}
                  href={`/units/${unit.id}?${new URLSearchParams({
                    ...(tab === "charges" ? { tab: "charges" } : {}),
                    ...(category === key ? {} : { category: key }),
                  })}`}
                >
                  {categoryLabels[key] ?? key}
                </Tag>
              ))}
            </div>
          )}
        </div>

        <div className="overflow-x-auto">
          <ServiceHistoryRows requests={scoped} />
        </div>

        {unit.lastServicedAt && (
          <p className="text-[13px] text-ink-muted">
            Last completed visit {formatDate(unit.lastServicedAt)}.
          </p>
        )}
      </div>
    </>
  );
}

function HeadStat({ value, label, tone = "neutral" }) {
  return (
    <div className="flex flex-col items-end gap-0.5">
      <span
        className={[
          "font-mono text-[22px] leading-none font-bold",
          tone === "danger" ? "text-danger" : "text-ink",
        ].join(" ")}
      >
        {value}
      </span>
      <span className="text-[11.5px] text-ink-muted">{label}</span>
    </div>
  );
}
