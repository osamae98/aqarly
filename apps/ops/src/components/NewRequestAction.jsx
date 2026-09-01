"use client";

import { useState } from "react";
import Modal from "@aqarly/ui/Modal";
import Toast from "@/components/Toast";
import {
  FormNote,
  PhotoField,
  PillChoice,
  SelectField,
  TextField,
  useFormAction,
} from "@/components/Field";
import { createRequestAction } from "@/app/actions";
import { maxRequestPhotos } from "@aqarly/core/operations";

// The mockup's "New request" dialog. Tenants raise their own requests in the
// tenant portal; this is the admin's path in for a walk-in or a phone call.
export default function NewRequestAction({ buildings = [], categories = [] }) {
  const [open, setOpen] = useState(false);
  const [propertyId, setPropertyId] = useState(buildings[0]?.id ?? "");
  // Closes on success; the toast carries the confirmation from there.
  const { submit, pending, result } = useFormAction(createRequestAction, {
    onSuccess: () => setOpen(false),
  });

  const building = buildings.find((b) => b.id === propertyId) ?? buildings[0];
  const units = building?.units ?? [];

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="cursor-pointer rounded-pill bg-brand px-4.5 py-2.5 text-sm font-semibold text-ink-inverse transition-colors hover:bg-brand-hover"
      >
        New request
      </button>

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="New request"
        size="lg"
        footer={
          <>
            <button
              type="submit"
              form="new-request"
              disabled={pending || units.length === 0}
              className="flex-1 cursor-pointer rounded-pill bg-brand py-3 text-[14.5px] font-semibold text-ink-inverse transition-colors hover:bg-brand-hover disabled:cursor-not-allowed disabled:opacity-45"
            >
              {pending ? "Creating…" : "Create request"}
            </button>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="cursor-pointer rounded-pill px-5 py-3 text-[14.5px] font-semibold text-ink-soft transition-colors hover:bg-page"
            >
              Cancel
            </button>
          </>
        }
      >
        <form
          id="new-request"
          action={submit}
          className="flex flex-col gap-3.5"
        >
          <div className="grid gap-3 sm:grid-cols-2">
            <SelectField
              label="Building"
              name="propertyId"
              value={propertyId}
              onChange={setPropertyId}
              options={buildings.map((b) => ({ value: b.id, label: b.name }))}
            />
            <SelectField
              label="Unit"
              name="unitId"
              options={units.map((unit) => ({
                value: unit.id,
                label: `Unit ${unit.label}${unit.tenant ? ` · ${unit.tenant}` : ""}`,
              }))}
            />
          </div>

          <PillChoice label="Category" name="category" options={categories} />
          <PillChoice
            label="Priority"
            name="priority"
            options={[
              { value: "urgent", label: "Emergency" },
              { value: "normal", label: "Standard" },
            ]}
            defaultValue="normal"
          />
          <TextField
            label="Title"
            name="summary"
            required
            placeholder="Short summary of the issue"
          />
          <TextField
            label="Description"
            name="description"
            textarea
            placeholder="What's happening, when it started, access notes…"
          />
          <PhotoField label="Photos" name="photos" max={maxRequestPhotos} />

          <FormNote state={result} />
        </form>
      </Modal>

      <Toast message={result?.ok ? result.message : null} />
    </>
  );
}
