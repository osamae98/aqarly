"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import Alert from "@aqarly/ui/Alert";
import Button from "@aqarly/ui/Button";
import Input from "@aqarly/ui/Input";
import Select from "@aqarly/ui/Select";
import { createMaintenanceRequestAction } from "@/app/actions";
import Field from "@/components/Field";
import PhotoPicker from "@/components/PhotoPicker";
import Textarea from "@/components/Textarea";
import VisitWindow from "@/components/VisitWindow";

// What the ops portal's "New request" asks, less what only ops decides: the
// building and unit are the tenant's own home, and who does the work is
// ops's call. The request arrives unassigned, marked as raised by the tenant.
const priorities = [
  { value: "normal", label: "Standard", hint: "Can wait for a booked visit" },
  { value: "urgent", label: "Emergency", hint: "Leaks, no power, no AC in the heat" },
];

export default function MaintenanceRequestForm({ categoryOptions }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState(null);
  const [category, setCategory] = useState("");
  const [priority, setPriority] = useState("normal");
  const [title, setTitle] = useState("");
  const [visitReady, setVisitReady] = useState(true);

  const canSubmit = Boolean(category) && title.trim().length > 0 && visitReady;

  function submit(formData) {
    setError(null);
    startTransition(async () => {
      const result = await createMaintenanceRequestAction(formData);
      if (result.ok) {
        router.push(`/requests/${result.id}`);
      } else {
        setError(result.error);
      }
    });
  }

  return (
    <form
      action={submit}
      className="flex flex-1 flex-col gap-6 md:mx-auto md:w-full md:max-w-lg"
    >
      {error && (
        <Alert tone="error" title="Couldn't submit that">
          {error}
        </Alert>
      )}

      <Select
        id="maintenance-category"
        name="category"
        label="Category"
        placeholder="Choose category"
        options={categoryOptions}
        onChange={setCategory}
      />

      <Field label="Priority">
        <input type="hidden" name="priority" value={priority} />
        <div className="grid grid-cols-2 gap-3">
          {priorities.map((option) => {
            const chosen = option.value === priority;
            const urgent = option.value === "urgent";
            return (
              <button
                key={option.value}
                type="button"
                aria-pressed={chosen}
                onClick={() => setPriority(option.value)}
                className={[
                  "flex flex-col gap-1 rounded-md p-4 text-left transition-colors",
                  chosen
                    ? urgent
                      ? "border-2 border-danger bg-danger-tint"
                      : "border-2 border-brand bg-brand-tint"
                    : "border border-border bg-surface hover:bg-sunken",
                ].join(" ")}
              >
                <span
                  className={[
                    "text-base font-semibold",
                    chosen ? (urgent ? "text-danger-ink" : "text-brand") : "text-ink",
                  ].join(" ")}
                >
                  {option.label}
                </span>
                <span className="text-xs text-ink-muted">{option.hint}</span>
              </button>
            );
          })}
        </div>
      </Field>

      <Input
        id="maintenance-title"
        name="summary"
        label="Title"
        required
        maxLength={80}
        placeholder="e.g. Kitchen sink is leaking"
        value={title}
        onChange={(event) => setTitle(event.target.value)}
      />

      <Field
        label="Describe the issue"
        htmlFor="maintenance-description"
        hint="Tip: include where the issue is, when it started, and how to get in"
      >
        <Textarea
          id="maintenance-description"
          name="description"
          placeholder="What's the problem? Be as specific as you can..."
        />
      </Field>

      <VisitWindow onChange={setVisitReady} />

      <Field label="Add photos (optional)">
        <PhotoPicker />
      </Field>

      <div className="mt-auto pt-2">
        <Button type="submit" size="lg" disabled={pending || !canSubmit} fullWidth>
          {pending ? "Submitting…" : "Submit request"}
        </Button>
      </div>
    </form>
  );
}
