import Alert from "@aqarly/ui/Alert";
import Button from "@aqarly/ui/Button";
import Select from "@aqarly/ui/Select";
import { categoryLabels, maintenanceCategories } from "@aqarly/core/operations";
import Field from "@/components/Field";
import Screen from "@/components/Screen";
import Textarea from "@/components/Textarea";
import { Camera } from "@/components/icons";

export const metadata = { title: "Maintenance" };

const categoryOptions = maintenanceCategories.map((category) => ({
  value: category,
  label: categoryLabels[category],
}));

export default function MaintenanceRequestPage() {
  return (
    <Screen title="Maintenance" backHref="/requests/new">
      <div className="flex flex-1 flex-col gap-6 md:mx-auto md:w-full md:max-w-lg">
        <Alert tone="warning" title="Not connected yet">
          This is the real form, but there is no write layer behind it —
          submitting needs a datastore and a signed-in tenant, neither of which
          exists yet.
        </Alert>

        <Select
          id="maintenance-category"
          label="Category"
          placeholder="Choose category"
          defaultValue=""
          options={categoryOptions}
        />

        <Field
          label="Describe the issue"
          htmlFor="maintenance-description"
          hint="Tip: include where the issue is and when it started"
        >
          <Textarea
            id="maintenance-description"
            placeholder="What's the problem? Be as specific as you can..."
          />
        </Field>

        <Field label="Add photos (optional)">
          <div className="rounded-md border-2 border-dashed border-border bg-sunken p-6 text-center">
            <Camera size={28} className="mx-auto mb-2 text-ink-soft" />
            <p className="text-sm font-semibold text-ink">Add photos</p>
            <p className="mt-1 text-xs text-ink-muted">
              Uploads need somewhere to store them — not wired up yet
            </p>
          </div>
        </Field>

        <div className="mt-auto pt-2">
          <Button size="lg" disabled fullWidth>
            Submit request
          </Button>
        </div>
      </div>
    </Screen>
  );
}
