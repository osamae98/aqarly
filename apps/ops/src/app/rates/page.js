import PageBar from "@/components/PageBar";
import RateActions from "@/components/RateActions";
import RemoveRateAction from "@/components/RemoveRateAction";
import {
  formatCharge,
  getHousekeepingRates,
  getRequests,
} from "@aqarly/core/operations";

export const metadata = {
  title: "Housekeeping rates",
};

const GRID =
  "grid grid-cols-[minmax(0,1fr)_104px_92px_128px_100px_40px] items-center gap-3.5";

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
        <RateActions services={rates.length} />
      </PageBar>

      <div className="flex flex-col gap-4 p-4 md:p-6">
        <div className="rounded-md border border-[var(--sky-300)] bg-info-tint px-4 py-3.5 text-[13.5px] leading-relaxed text-info-ink">
          <b>A rate applies everywhere the moment you save it.</b> Tenants see
          the price before they book, technicians see it again when they close
          the job, and it&apos;s the number printed on the statement. Changing a
          live rate never touches bookings already made; those keep the price
          they were booked at.
        </div>

        <div className="overflow-x-auto">
          <div className="min-w-[52rem] overflow-hidden rounded-md border border-border bg-surface">
            <div
              className={`${GRID} border-b border-border px-3 py-3 text-[11px] font-bold tracking-[0.1em] uppercase text-ink-muted`}
            >
              <span>Service</span>
              <span className="text-center">Price</span>
              <span className="text-center">Booked</span>
              <span className="text-center">Charged to date</span>
              <span>Billed to</span>
              <span className="sr-only">Actions</span>
            </div>

            <div className="divide-y divide-sunken">
              {rates.map((rate) => {
                const used = usage.get(rate.serviceType) ?? {
                  count: 0,
                  charged: 0,
                };

                return (
                  <div key={rate.serviceType} className={`${GRID} px-3 py-3.5`}>
                    <span className="min-w-0 truncate text-sm font-semibold text-ink">
                      {rate.label}
                    </span>
                    <span className="text-center font-mono text-sm font-bold text-ink">
                      {formatCharge(rate.price)}
                    </span>
                    <span className="text-center font-mono text-[13px] text-ink-soft">
                      {used.count}
                    </span>
                    <span className="text-center font-mono text-[13px] text-ink-soft">
                      {formatCharge(used.charged)}
                    </span>
                    <span className="text-[13px] text-ink-soft">Tenant</span>
                    <span>
                      <RemoveRateAction
                        serviceType={rate.serviceType}
                        label={rate.label}
                        booked={used.count}
                      />
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {openBookings > 0 && (
          <p className="text-[13px] text-ink-muted">
            {openBookings} housekeeping{" "}
            {openBookings === 1 ? "booking is" : "bookings are"} still open at
            the price it was booked at.
          </p>
        )}
      </div>
    </>
  );
}
