"use client";

import { useState } from "react";
import Modal from "@aqarly/ui/Modal";
import Toast from "@/components/Toast";
import { FormNote, Label, TextField, useFormAction } from "@/components/Field";
import { createRequestAction } from "@/app/actions";

// The repeat-fault banner's action. The design sends this to the building's
// owner for approval; approvals have no home yet, so it raises the
// replacement as a request on the unit and says who would sign it off.
export default function ReplacementAction({
  unitId,
  category,
  subject,
  summary,
  reason,
  approver,
}) {
  const [open, setOpen] = useState(false);
  const { submit, pending, result } = useFormAction(createRequestAction, {
    onSuccess: () => setOpen(false),
  });

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="cursor-pointer rounded-pill bg-brand px-4 py-2.5 text-[13.5px] font-semibold text-ink-inverse transition-colors hover:bg-brand-hover"
      >
        Raise replacement request
      </button>

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="Raise replacement request"
        description={subject}
        size="lg"
        footer={
          <>
            <button
              type="submit"
              form="raise-replacement"
              disabled={pending}
              className="flex-1 cursor-pointer rounded-pill bg-brand py-3 text-[14.5px] font-semibold text-ink-inverse transition-colors hover:bg-brand-hover disabled:cursor-not-allowed disabled:opacity-45"
            >
              {pending ? "Raising…" : "Raise on this unit"}
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
          id="raise-replacement"
          action={submit}
          className="flex flex-col gap-3.5"
        >
          <input type="hidden" name="unitId" value={unitId} />
          <input type="hidden" name="category" value={category} />
          <input type="hidden" name="priority" value="normal" />

          <TextField label="Title" name="summary" required defaultValue={summary} />
          <TextField
            label="Reason"
            name="description"
            textarea
            defaultValue={reason}
          />

          <div className="flex flex-col gap-1.5">
            <Label>Approver</Label>
            <p className="rounded-sm border border-border bg-page px-3.5 py-2.5 text-sm text-ink-soft">
              {approver}
            </p>
          </div>

          <p className="text-xs text-ink-muted">
            Owner approval has nowhere to live yet, so this is raised as a
            request on the unit rather than sent out for sign-off.
          </p>
          <FormNote state={result} />
        </form>
      </Modal>

      <Toast message={result?.ok ? result.message : null} />
    </>
  );
}
