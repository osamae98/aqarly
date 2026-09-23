import Link from "next/link";
import { formatCharge, getHousekeepingRates } from "@aqarly/core/operations";
import Field from "@/components/Field";
import HousekeepingRequestForm from "@/components/HousekeepingRequestForm";
import Screen from "@/components/Screen";

export const metadata = { title: "Book cleaning" };

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

        <HousekeepingRequestForm selected={selected} />
      </div>
    </Screen>
  );
}
