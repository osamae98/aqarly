import Link from "next/link";
import MaintenanceCard from "@/components/MaintenanceCard";
import PageBar from "@/components/PageBar";
import ReplacementAction from "@/components/ReplacementAction";
import UnitCrumb from "@/components/UnitCrumb";
import {
  categoryLabels,
  formatCharge,
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

export default async function UnitDetailPage({ params }) {
  const { id } = await params;
  const unit = await getUnitById(id);

  if (!unit) notFound();

  const all = await getRequests({ unitId: id, sort: "newest" });
  const open = all.filter((request) => request.stage !== "done");
  const hasHistory = all.length > open.length;

  const repeatLabel = unit.repeatFault
    ? (categoryLabels[unit.repeatFault.category] ?? unit.repeatFault.category)
    : null;

  return (
    <>
      <PageBar
        eyebrow={<UnitCrumb unit={unit} />}
        title={`Unit ${unit.label} · ${unit.property?.name ?? ""}`}
        meta={`${unit.bedrooms} BR · ${unit.bathrooms} bath · ${unit.tenant?.name ?? "no tenant"}`}
        stats={
          <div className="flex flex-col items-end gap-0.5">
            <span className="font-mono text-[22px] leading-none font-bold text-ink">
              {open.length}
            </span>
            <span className="text-[11.5px] text-ink-muted">open now</span>
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

        <section className="flex flex-col gap-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-base font-bold text-ink">Current maintenance</h2>
            {hasHistory && (
              <Link
                href={`/units/${unit.id}/history`}
                className="rounded-pill border border-border-strong bg-surface px-4 py-2 text-[13.5px] font-semibold text-ink transition-colors hover:border-brand hover:text-brand"
              >
                View maintenance history →
              </Link>
            )}
          </div>

          {open.length === 0 ? (
            <p className="rounded-md border border-dashed border-border-strong py-10 text-center text-sm text-ink-muted">
              No open maintenance on this unit.
            </p>
          ) : (
            <div className="grid gap-5 md:grid-cols-2 2xl:grid-cols-3">
              {open.map((request) => (
                <MaintenanceCard key={request.id} request={request} />
              ))}
            </div>
          )}
        </section>
      </div>
    </>
  );
}
