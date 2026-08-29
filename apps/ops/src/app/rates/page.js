import PageBar from "@/components/PageBar";
import {
  formatCharge,
  getHousekeepingRates,
  getRequests,
} from "@aqarly/core/operations";

export const metadata = {
  title: "Housekeeping rates",
};

const GRID =
  "grid grid-cols-[minmax(0,1fr)_104px_92px_128px_100px_92px] items-center gap-3.5";

export default async function RatesPage() {
  const [rates, booked] = await Promise.all([
    getHousekeepingRates(),
    getRequests({ type: "housekeeping" }),
  ]);

  // How often each rate has actually been charged — the reason a rate change
  // matters, shown next to the rate itself.
  const usage = new Map();
  for (const request of booked) {
    const entry = usage.get(request.category) ?? { count: 0, charged: 0 };
    entry.count += 1;
    entry.charged += request.charge ?? 0;
    usage.set(request.category, entry);
  }

  const openBookings = booked.filter((r) => r.stage !== "done").length;

  return (
    <>
      <PageBar
        title="Housekeeping rates"
        meta={`${rates.length} services · applies to every building · read by both portals`}
      >
        <span
          title="Versioning needs a write path"
          className="cursor-not-allowed rounded-pill border border-border-strong px-4 py-2 text-[13.5px] font-semibold text-ink-soft opacity-45"
        >
          Version history
        </span>
        <span
          title="Editing rates needs a write path"
          className="cursor-not-allowed rounded-pill bg-brand px-4.5 py-2.5 text-[13.5px] font-semibold text-ink-inverse opacity-45"
        >
          New rate
        </span>
      </PageBar>

      <div className="flex flex-col gap-4 p-4 md:p-6">
        <div className="rounded-md border border-[var(--sky-300)] bg-info-tint px-4 py-3.5 text-[13.5px] leading-relaxed text-info-ink">
          <b>Tenants see the rate before they book</b>, the technician sees it
          again before closing the job, and it appears on the statement with the
          same wording — so a charge is never a surprise. Rates are read-only
          here: changing one means changing the seed data in{" "}
          <code className="font-mono">packages/core</code> until a write path
          exists.
        </div>

        <div className="overflow-x-auto">
          <div className="min-w-[52rem]">
            <div className={`${GRID} pb-2.5 text-[11px] font-bold tracking-[0.1em] uppercase text-ink-muted`}>
              <span>Service</span>
              <span className="text-end">Price</span>
              <span className="text-end">Booked</span>
              <span className="text-end">Charged to date</span>
              <span>Billed to</span>
              <span>Status</span>
            </div>

            {rates.map((rate) => {
              const used = usage.get(rate.serviceType) ?? {
                count: 0,
                charged: 0,
              };

              return (
                <div
                  key={rate.serviceType}
                  className={`${GRID} border-t border-border py-3.5`}
                >
                  <span className="min-w-0 truncate text-sm font-semibold text-ink">
                    {rate.label}
                  </span>
                  <span className="text-end font-mono text-sm font-bold text-ink">
                    {formatCharge(rate.price)}
                  </span>
                  <span className="text-end font-mono text-[13px] text-ink-soft">
                    {used.count}
                  </span>
                  <span className="text-end font-mono text-[13px] text-ink-soft">
                    {formatCharge(used.charged)}
                  </span>
                  <span className="text-[13px] text-ink-soft">Tenant</span>
                  <span>
                    <span className="rounded-pill bg-success-tint px-2.5 py-[3px] text-xs font-semibold text-success-ink">
                      Live
                    </span>
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {openBookings > 0 && (
          <p className="text-[13px] text-ink-muted">
            {openBookings} housekeeping{" "}
            {openBookings === 1 ? "booking is" : "bookings are"} still open.
            A rate change would not touch them — bookings keep the price they
            were made at.
          </p>
        )}
      </div>
    </>
  );
}
