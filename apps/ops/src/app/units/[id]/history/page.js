import Link from "next/link";
import PageBar from "@/components/PageBar";
import ServiceHistoryRows from "@/components/ServiceHistoryRows";
import UnitCrumb from "@/components/UnitCrumb";
import {
  categoryLabels,
  formatDate,
  getRequests,
  getUnitById,
} from "@aqarly/core/operations";
import { notFound } from "next/navigation";

export async function generateMetadata({ params }) {
  const { id } = await params;
  const unit = await getUnitById(id);
  return { title: unit ? `Unit ${unit.label} history` : "Maintenance history" };
}

export default async function UnitHistoryPage({ params, searchParams }) {
  const { id } = await params;
  const query = await searchParams;
  const unit = await getUnitById(id);

  if (!unit) notFound();

  const done = await getRequests({
    unitId: id,
    type: "maintenance",
    stage: "done",
    sort: "newest",
  });

  const categoryKeys = [...new Set(done.map((request) => request.category))];
  const category = categoryKeys.includes(query.category) ? query.category : null;
  const scoped = done.filter((request) => !category || request.category === category);

  const categories = [
    { value: null, label: "All work", count: done.length },
    ...categoryKeys.map((key) => ({
      value: key,
      label: categoryLabels[key] ?? key,
      count: done.filter((request) => request.category === key).length,
    })),
  ];

  return (
    <>
      <PageBar
        eyebrow={<UnitCrumb unit={unit} current="Maintenance history" />}
        title="Maintenance history"
        meta={`Unit ${unit.label} · ${unit.property?.name ?? ""} · ${unit.tenant?.name ?? "no tenant"}`}
        stats={
          <div className="flex flex-col items-end gap-0.5">
            <span className="font-mono text-[22px] leading-none font-bold text-ink">
              {done.length}
            </span>
            <span className="text-[11.5px] text-ink-muted">past records</span>
          </div>
        }
      />

      <div className="flex flex-col gap-4 p-4 md:p-6">
        <Link
          href={`/units/${unit.id}`}
          className="self-start text-[13.5px] font-semibold text-brand hover:text-brand-hover"
        >
          ← Back to unit {unit.label}
        </Link>

        <div className="overflow-x-auto">
          <ServiceHistoryRows
            requests={scoped}
            categories={categories}
            searchParams={query}
            basePath={`/units/${unit.id}/history`}
          />
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
