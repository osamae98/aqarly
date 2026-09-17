import Link from "next/link";
import BookingCard from "@/components/BookingCard";
import PageBar from "@/components/PageBar";
import UnitCrumb from "@/components/UnitCrumb";
import { getRequests, getUnitById } from "@aqarly/core/operations";
import { notFound } from "next/navigation";

export async function generateMetadata({ params }) {
  const { id } = await params;
  const unit = await getUnitById(id, { type: "housekeeping" });
  return { title: unit ? `Unit ${unit.label}` : "Unit" };
}

export default async function UnitDetailPage({ params }) {
  const { id } = await params;
  const unit = await getUnitById(id, { type: "housekeeping" });

  if (!unit) notFound();

  const all = await getRequests({
    unitId: id,
    type: "housekeeping",
    sort: "newest",
  });
  const open = all.filter((request) => request.stage !== "done");
  const hasHistory = all.length > open.length;

  // No repeat-fault flag here: housekeeping coming back to the same unit is
  // the service working, not something failing.
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
        <section className="flex flex-col gap-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-base font-bold text-ink">Current housekeeping</h2>
            {hasHistory && (
              <Link
                href={`/units/${unit.id}/history`}
                className="rounded-pill border border-border-strong bg-surface px-4 py-2 text-[13.5px] font-semibold text-ink transition-colors hover:border-brand hover:text-brand"
              >
                View housekeeping history →
              </Link>
            )}
          </div>

          {open.length === 0 ? (
            <p className="rounded-md border border-dashed border-border-strong py-10 text-center text-sm text-ink-muted">
              No open housekeeping on this unit.
            </p>
          ) : (
            <div className="grid gap-5 md:grid-cols-2 2xl:grid-cols-3">
              {open.map((request) => (
                <BookingCard key={request.id} request={request} />
              ))}
            </div>
          )}
        </section>
      </div>
    </>
  );
}
