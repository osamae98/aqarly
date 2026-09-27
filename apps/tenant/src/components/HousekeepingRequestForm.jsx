"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import Alert from "@aqarly/ui/Alert";
import Button from "@aqarly/ui/Button";
import Input from "@aqarly/ui/Input";
import { formatCharge } from "@aqarly/core/labels";
import { createHousekeepingRequestAction } from "@/app/actions";
import Field from "@/components/Field";
import PhotoPicker from "@/components/PhotoPicker";
import Textarea from "@/components/Textarea";
import VisitWindow from "@/components/VisitWindow";

// What the housekeeping portal's "New booking" asks, less what only it
// decides (the unit is the tenant's own; who cleans is the portal's call).
// A booking needs its day and window; the price is the rate card's.
export default function HousekeepingRequestForm({ selected }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState(null);
  const [visitReady, setVisitReady] = useState(false);

  function submit(formData) {
    setError(null);
    startTransition(async () => {
      const result = await createHousekeepingRequestAction(formData);
      if (result.ok) {
        router.push(`/requests/${result.id}`);
      } else {
        setError(result.error);
      }
    });
  }

  return (
    <form action={submit} className="contents">
      {error && (
        <Alert tone="error" title="Couldn't submit that">
          {error}
        </Alert>
      )}

      <input type="hidden" name="category" value={selected.serviceType} />
      <input type="hidden" name="label" value={selected.label} />

      {/* Remounted per service, so the title starts as the service picked. */}
      <Input
        key={selected.serviceType}
        id="housekeeping-title"
        name="summary"
        label="Title"
        maxLength={80}
        defaultValue={selected.label}
      />

      <Field label="Notes (optional)" htmlFor="housekeeping-description">
        <Textarea
          id="housekeeping-description"
          name="description"
          placeholder="Anything the cleaner should know: rooms to focus on, pets, how to get in..."
        />
      </Field>

      <VisitWindow required onChange={setVisitReady} />

      <Field label="Add photos (optional)">
        <PhotoPicker />
      </Field>

      <div className="rounded-md bg-sunken p-4">
        <div className="flex items-baseline justify-between">
          <span className="text-sm text-ink-soft">Service total</span>
          <span className="text-xl font-bold text-ink">{formatCharge(selected.price)}</span>
        </div>
        <p className="mt-2 text-xs text-ink-muted">
          Billed to your account after completion
        </p>
      </div>

      <div className="mt-auto pt-2">
        <Button type="submit" size="lg" disabled={pending || !visitReady} fullWidth>
          {pending ? "Booking…" : "Confirm booking"}
        </Button>
      </div>
    </form>
  );
}
