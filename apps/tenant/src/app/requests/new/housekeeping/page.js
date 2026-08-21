import Link from "next/link";
import Alert from "@aqarly/ui/Alert";
import Button from "@aqarly/ui/Button";
import Input from "@aqarly/ui/Input";
import Select from "@aqarly/ui/Select";
import { formatCharge, getHousekeepingRates } from "@aqarly/core/operations";
import Field from "@/components/Field";
import Screen from "@/components/Screen";

export const metadata = { title: "Book cleaning" };

const timeSlots = ["9AM–12PM", "12PM–3PM", "3PM–6PM"];

export default async function HousekeepingRequestPage({ searchParams }) {
  const { service } = await searchParams;
  const rates = await getHousekeepingRates();

  // Which service is picked is a URL concern, so this screen stays a server
  // component and the price below updates on navigation.
  const selected =
    rates.find((rate) => rate.serviceType === service) ?? rates[0];

  return (
    <Screen title="Book Cleaning" backHref="/requests/new">
      <div className="flex flex-1 flex-col gap-6 md:mx-auto md:w-full md:max-w-lg">
        <Alert tone="warning" title="Not connected yet">
          Prices are the real, centrally-set rates, but confirming a booking
          needs a write path that does not exist yet.
        </Alert>

        <Field label="Service type">
          <div className="flex flex-col gap-3">
            {rates.map((rate) => {
              const isSelected = rate.serviceType === selected.serviceType;

              return (
                <Link
                  key={rate.serviceType}
                  href={`/requests/new/housekeeping?service=${rate.serviceType}`}
                  aria-current={isSelected ? "true" : undefined}
                  className={[
                    "flex items-center gap-3 rounded-md p-4 transition-colors",
                    isSelected
                      ? "border-2 border-brand bg-brand-tint"
                      : "border border-border bg-surface hover:bg-sunken",
                  ].join(" ")}
                >
                  <span
                    className={[
                      "flex size-5 shrink-0 items-center justify-center rounded-pill border-2",
                      isSelected ? "border-brand" : "border-border-strong",
                    ].join(" ")}
                  >
                    {isSelected && (
                      <span className="size-2.5 rounded-pill bg-brand" />
                    )}
                  </span>
                  <span className="flex-1 text-base font-semibold text-ink">
                    {rate.label}
                  </span>
                  <span
                    className={[
                      "text-lg font-bold",
                      isSelected ? "text-brand" : "text-ink-soft",
                    ].join(" ")}
                  >
                    {formatCharge(rate.price)}
                  </span>
                </Link>
              );
            })}
          </div>
        </Field>

        <div className="flex gap-3">
          <div className="flex-1">
            <Input id="housekeeping-date" label="Date" type="date" />
          </div>
          <div className="flex-1">
            <Select id="housekeeping-time" label="Time" options={timeSlots} />
          </div>
        </div>

        <div className="rounded-md bg-sunken p-4">
          <div className="flex items-baseline justify-between">
            <span className="text-sm text-ink-soft">Service total</span>
            <span className="text-xl font-bold text-ink">
              {formatCharge(selected.price)}
            </span>
          </div>
          <p className="mt-2 text-xs text-ink-muted">
            Billed to your account after completion
          </p>
        </div>

        <div className="mt-auto pt-2">
          <Button size="lg" disabled fullWidth>
            Confirm booking
          </Button>
        </div>
      </div>
    </Screen>
  );
}
