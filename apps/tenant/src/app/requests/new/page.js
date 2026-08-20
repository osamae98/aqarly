import Link from "next/link";
import Alert from "@aqarly/ui/Alert";
import Button from "@aqarly/ui/Button";
import Card from "@aqarly/ui/Card";
import Input from "@aqarly/ui/Input";
import Select from "@aqarly/ui/Select";
import { formatCharge, getHousekeepingRates } from "@aqarly/core/operations";

export const metadata = { title: "New request" };

const maintenanceCategories = [
  { value: "plumbing", label: "Plumbing" },
  { value: "electrical", label: "Electrical" },
  { value: "ac", label: "AC" },
  { value: "appliance", label: "Appliance" },
  { value: "other", label: "Other" },
];

export default async function NewRequestPage() {
  const rates = await getHousekeepingRates();

  return (
    <div className="flex flex-col gap-6">
      <div>
        <Link
          href="/"
          className="text-sm text-ink-soft transition-colors hover:text-brand"
        >
          ← All requests
        </Link>
        <h1 className="mt-3 text-xl font-semibold tracking-tight text-ink">
          New request
        </h1>
      </div>

      <Alert tone="warning" title="Not connected yet">
        The form below is the real layout, but there is no write layer behind it
        — submitting a request needs a datastore and a signed-in tenant, neither
        of which exists yet.
      </Alert>

      <Card title="Maintenance">
        <div className="flex flex-col gap-4">
          <Select
            id="maintenance-category"
            label="What needs attention?"
            required
            placeholder="Choose a category"
            options={maintenanceCategories}
          />
          <Input
            id="maintenance-description"
            label="Tell us what's happening"
            placeholder="e.g. AC blows warm air in the main bedroom"
          />
          <Button disabled fullWidth>
            Submit request
          </Button>
        </div>
      </Card>

      <Card
        title="Housekeeping"
        description="Prices are set centrally and shown before you confirm."
      >
        <div className="flex flex-col gap-4">
          <ul className="flex flex-col divide-y divide-border">
            {rates.map((rate) => (
              <li
                key={rate.serviceType}
                className="flex items-center justify-between py-3 first:pt-0"
              >
                <span className="text-sm text-ink">{rate.label}</span>
                <span className="text-sm font-medium text-ink">
                  {formatCharge(rate.price)}
                </span>
              </li>
            ))}
          </ul>
          <Input id="housekeeping-date" label="Preferred date" type="date" />
          <Button variant="outline" disabled fullWidth>
            Book a visit
          </Button>
        </div>
      </Card>
    </div>
  );
}
