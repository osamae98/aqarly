"use client";

import { useState } from "react";
import Icon from "@aqarly/ui/Icon";
import ConfirmDialog from "@/components/ConfirmDialog";
import Toast from "@/components/Toast";
import { useFormAction } from "@/components/Field";
import { removeRateAction } from "@/app/actions";

// Taking a service off the rate card. Tenants book against this list, so the
// removal is refused while anything open is still priced against it — the
// dialog carries that back rather than the button hiding it up front.
export default function RemoveRateAction({ serviceType, label, booked = 0 }) {
  const [open, setOpen] = useState(false);
  const { submit, pending, result, reset } = useFormAction(removeRateAction, {
    onSuccess: () => setOpen(false),
  });

  function confirm() {
    const form = new FormData();
    form.set("serviceType", serviceType);
    submit(form);
  }

  return (
    <>
      <button
        type="button"
        onClick={() => {
          reset();
          setOpen(true);
        }}
        aria-label={`Remove ${label}`}
        title={`Remove ${label}`}
        className="flex cursor-pointer rounded-pill p-1.5 text-ink-muted transition-colors hover:bg-danger-tint hover:text-danger"
      >
        <Icon name="trash-2" size={15} />
      </button>

      <ConfirmDialog
        open={open}
        onClose={() => setOpen(false)}
        title="Remove from the rate card"
        description={
          booked > 0
            ? `${label} stops being bookable. The ${booked === 1 ? "one booking already made keeps the price it was made at" : `${booked} bookings already made keep the price they were made at`}.`
            : `${label} stops being bookable. Nothing has been booked against it.`
        }
        confirmLabel="Remove service"
        pending={pending}
        result={result}
        onConfirm={confirm}
      />

      <Toast message={result?.ok ? result.message : null} />
    </>
  );
}
