"use client";

import Modal from "@aqarly/ui/Modal";
import Toast from "@/components/Toast";
import { FormNote, TextField, useFormAction } from "@/components/Field";
import { addStaffAction, updateStaffAction } from "@/app/actions";

// One form for both halves of the roster's write path. Every technician here
// is maintenance crew, so name is the only field ops owns: Ops PRD §9 puts
// contracts, pay and the rest in the HRMS from Phase 3, so asking for them
// now would be inventing a record this portal is not allowed to keep.
export default function StaffDialog({ open, onClose, member = null }) {
  const editing = Boolean(member);
  const { submit, pending, result } = useFormAction(
    editing ? updateStaffAction : addStaffAction,
    { onSuccess: () => onClose?.() },
  );

  return (
    <>
      <Modal
        open={open}
        onClose={onClose}
        title={editing ? `Edit ${member.name}` : "Add to the roster"}
        footer={
          <>
            <button
              type="submit"
              form="staff-form"
              disabled={pending}
              className="flex-1 cursor-pointer rounded-pill bg-brand py-3 text-[14.5px] font-semibold text-ink-inverse transition-colors hover:bg-brand-hover disabled:cursor-not-allowed disabled:opacity-45"
            >
              {pending
                ? "Saving…"
                : editing
                  ? "Save changes"
                  : "Add to roster"}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="cursor-pointer rounded-pill px-5 py-3 text-[14.5px] font-semibold text-ink-soft transition-colors hover:bg-page"
            >
              Cancel
            </button>
          </>
        }
      >
        <form id="staff-form" action={submit} className="flex flex-col gap-3.5">
          {editing && <input type="hidden" name="id" value={member.id} />}
          <input type="hidden" name="role" value="maintenance" />

          <TextField
            label="Name"
            name="name"
            required
            defaultValue={member?.name}
            placeholder="Full name"
          />

          <p className="text-xs text-ink-muted">
            Load and buildings are derived from the work assigned to them, so
            there is nothing to set here. Contract, pay and contact details
            belong to the HRMS from Phase 3.
          </p>

          <FormNote state={result} />
        </form>
      </Modal>

      <Toast message={result?.ok ? result.message : null} />
    </>
  );
}
