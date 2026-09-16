import Link from "next/link";
import ChargeRows from "@/components/ChargeRows";
import PageBar from "@/components/PageBar";
import ReplacementAction from "@/components/ReplacementAction";
import ServiceHistoryRows from "@/components/ServiceHistoryRows";
import Tabs from "@aqarly/ui/Tabs";
import {
  categoryLabels,
  formatCharge,
  formatDate,
  getRequests,
  getUnitById,
  repeatFaultRule,
} from "@aqarly/core/operations";
import { notFound } from "next/navigation";

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

  const all = await getRequests({
    unitId: id,
    type: "maintenance",
    sort: "newest",
  });

  const tab = query.tab === "charges" ? "charges" : "history";
  const charged = all.filter((request) => request.charge);
  const pool = tab === "charges" ? charged : all;

  const categoryKeys = [...new Set(all.map((request) => request.category))];
  const category = categoryKeys.includes(query.category) ? query.category : null;

  const scoped = pool.filter(
    (request) => !category || request.category === category,
  );

  const categories = [
    { value: null, label: "All work", count: pool.length },
    ...categoryKeys.map((key) => ({
      value: key,
      label: categoryLabels[key] ?? key,
      count: pool.filter((request) => request.category === key).length,
    })),
  ];

  const chargedTotal = charged.reduce((sum, r) => sum + (r.charge ?? 0), 0);
  const repeatLabel = unit.repeatFault
    ? (categoryLabels[unit.repeatFault.category] ?? unit.repeatFault.category)
    : null;

  return (
    <>
      <PageBar
        eyebrow={
          <span className="flex items-center gap-1.5">
            <Link href="/units" className="hover:text-brand">
              Buildings
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
          // The header counts what the open tab is about.
          <div className="flex gap-6">
            {tab === "charges" ? (
              <>
                <HeadStat value={charged.length} label="charges on record" />
                <HeadStat
                  value={formatCharge(chargedTotal)}
                  label="charged to date"
                />
              </>
            ) : (
              <>
                <HeadStat value={unit.requestCount} label="requests on record" />
                <HeadStat
                  value={formatCharge(unit.lifetimeSpend)}
                  label="lifetime spend"
                />
              </>
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
                Repeat-fault flag — {repeatLabel} serviced{" "}
                {unit.repeatFault.count} times
              </p>
              <p className="text-[13px] text-warning-ink">
                {repeatFaultRule.occurrences} or more visits inside{" "}
                {Math.round(repeatFaultRule.withinDays / 30)} months
                {unit.repeatFault.spend
                  ? `, costing ${formatCharge(unit.repeatFault.spend)}`
                  : ", none of them charged yet"}
                . Price a replacement before booking another repair.
              </p>
            </div>
            <ReplacementAction
              unitId={unit.id}
              category={unit.repeatFault.category}
              subject={`Unit ${unit.label} · ${unit.property?.name ?? ""} · ${repeatLabel}`}
              summary={`Replace ${repeatLabel.toLowerCase()} — repeat fault`}
              reason={`${unit.repeatFault.count} ${repeatLabel} visits inside ${Math.round(
                repeatFaultRule.withinDays / 30,
              )} months${
                unit.repeatFault.spend
                  ? `, costing ${formatCharge(unit.repeatFault.spend)} so far`
                  : ""
              }. Replacing is likely cheaper than another like-for-like repair.`}
              approver={`Property owner — ${unit.property?.name ?? "unknown building"}`}
            />
          </div>
        )}

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
              count: charged.length,
              href: `/units/${unit.id}?tab=charges${category ? `&category=${category}` : ""}`,
            },
          ]}
        />

        <div className="overflow-x-auto">
          {tab === "charges" ? (
            <ChargeRows requests={scoped} />
          ) : (
            <ServiceHistoryRows
              requests={scoped}
              categories={categories}
              searchParams={query}
              basePath={`/units/${unit.id}`}
            />
          )}
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

function HeadStat({ value, label }) {
  return (
    <div className="flex flex-col items-end gap-0.5">
      <span className="font-mono text-[22px] leading-none font-bold text-ink">
        {value}
      </span>
      <span className="text-[11.5px] text-ink-muted">{label}</span>
    </div>
  );
}
