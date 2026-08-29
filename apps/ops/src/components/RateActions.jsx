"use client";

import { useState } from "react";
import Modal from "@aqarly/ui/Modal";
import Toast from "@/components/Toast";
import { FormNote, TextField, useFormAction } from "@/components/Field";
import { addRateAction } from "@/app/actions";

// The rate card's two header actions. A new rate becomes a real service the
// queue can categorise against; versioning is still the thing that has
// nowhere to live, and the history says so.
export default function RateActions({ services }) {
  const [open, setOpen] = useState(null);
  const { submit, pending, result } = useFormAction(addRateAction, {
    onSuccess: () => setOpen(null),
  });

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen("history")}
        className="cursor-pointer rounded-pill border border-border-strong px-4 py-2 text-[13.5px] font-semibold text-ink-soft transition-colors hover:bg-sunken"
      >
        Version history
      </button>
      <button
        type="button"
        onClick={() => setOpen("new")}
        className="cursor-pointer rounded-pill bg-brand px-4.5 py-2.5 text-[13.5px] font-semibold text-ink-inverse transition-colors hover:bg-brand-hover"
      >
        New rate
      </button>

      <Modal
        open={open === "history"}
        onClose={() => setOpen(null)}
        title="Version history"
      >
        <div className="flex flex-col gap-3">
          <div className="rounded-md border-[1.5px] border-brand bg-brand-tint p-3.5">
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-ink">Version 1</span>
              <span className="rounded-pill bg-brand px-2 py-px text-[10.5px] font-bold tracking-[0.08em] uppercase text-ink-inverse">
                Current
              </span>
            </div>
            <p className="mt-1 text-[13px] text-ink-soft">
              {services} {services === 1 ? "service" : "services"}, including
              anything added since the portal started.
            </p>
          </div>
          <p className="text-xs text-ink-muted">
            Rate changes are versioned and dated, never retroactive — but
            publishing a version needs somewhere durable to publish it to, so
            there is only ever one until the data has a home outside this
            process.
          </p>
        </div>
      </Modal>

      <Modal
        open={open === "new"}
        onClose={() => setOpen(null)}
        title="New rate"
        footer={
          <>
            <button
              type="submit"
              form="new-rate"
              disabled={pending}
              className="flex-1 cursor-pointer rounded-pill bg-brand py-3 text-[14.5px] font-semibold text-ink-inverse transition-colors hover:bg-brand-hover disabled:cursor-not-allowed disabled:opacity-45"
            >
              {pending ? "Adding…" : "Add to rate card"}
            </button>
            <button
              type="button"
              onClick={() => setOpen(null)}
              className="cursor-pointer rounded-pill px-5 py-3 text-[14.5px] font-semibold text-ink-soft transition-colors hover:bg-page"
            >
              Cancel
            </button>
          </>
        }
      >
        <form id="new-rate" action={submit} className="flex flex-col gap-3.5">
          <TextField
            label="Service name"
            name="label"
            required
            placeholder="e.g. Balcony pressure wash"
          />
          <TextField
            label="Price"
            name="price"
            required
            placeholder="AED"
          />
          <p className="text-xs text-ink-muted">
            Housekeeping is billed to the tenant, so a new service is charged
            the same way as the rest of the card.
          </p>
          <FormNote state={result} />
        </form>
      </Modal>

      <Toast message={result?.ok ? result.message : null} />
    </>
  );
}
