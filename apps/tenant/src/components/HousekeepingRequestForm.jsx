"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import Alert from "@aqarly/ui/Alert";
import Button from "@aqarly/ui/Button";
import Input from "@aqarly/ui/Input";
import Select from "@aqarly/ui/Select";
import { formatCharge } from "@aqarly/core/labels";
import { createHousekeepingRequestAction } from "@/app/actions";

const timeSlots = ["9AM–12PM", "12PM–3PM", "3PM–6PM"];

export default function HousekeepingRequestForm({ selected }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState(null);
  const [scheduledDate, setScheduledDate] = useState("");

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

      <div className="flex gap-3">
        <div className="flex-1">
          <Input
            id="housekeeping-date"
            name="scheduledDate"
            label="Date"
            type="date"
            required
            value={scheduledDate}
            onChange={(event) => setScheduledDate(event.target.value)}
          />
        </div>
        <div className="flex-1">
          <Select
            id="housekeeping-time"
            name="scheduledSlot"
            label="Time"
            options={timeSlots}
          />
        </div>
      </div>

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
        <Button type="submit" size="lg" disabled={pending || !scheduledDate} fullWidth>
          {pending ? "Booking…" : "Confirm booking"}
        </Button>
      </div>
    </form>
  );
}
