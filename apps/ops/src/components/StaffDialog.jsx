"use client";

import Modal from "@aqarly/ui/Modal";
import Toast from "@/components/Toast";
import Initials from "@/components/Initials";
import {
  FormNote,
  PhotoField,
  TextField,
  useFormAction,
} from "@/components/Field";
import { addStaffAction, updateStaffAction } from "@/app/actions";

// One form for both halves of the roster's write path. Every technician here
// is maintenance crew, so only name, mobile and photo are ops-owned: Ops PRD
// §9 puts contracts, pay and the rest in the HRMS from Phase 3, so asking for
// them now would be inventing a record this portal is not allowed to keep.
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

          <TextField
            label="Mobile number"
            name="phone"
            type="tel"
            required
            defaultValue={member?.phone}
            placeholder="+971 50 123 4567"
          />

          {editing && member.photo ? (
            <div className="flex items-end gap-3">
              <Initials name={member.name} src={member.photo} size={64} />
              <div className="min-w-0 flex-1">
                <PhotoField
                  label="Photo"
                  name="photo"
                  max={1}
                  accept="image/*"
                  hint="Choose a new photo to replace this one, 2 MB max."
                />
              </div>
            </div>
          ) : (
            <PhotoField
              label="Photo"
              name="photo"
              max={1}
              accept="image/*"
              hint="Optional · one photo, 2 MB max."
            />
          )}

          <p className="text-xs text-ink-muted">
            Jobs in progress and closed are derived from the work assigned to
            them, so there is nothing to set here. Contract and pay belong to
            the HRMS from Phase 3.
          </p>

          <FormNote state={result} />
        </form>
      </Modal>

      <Toast message={result?.ok ? result.message : null} />
    </>
  );
}
