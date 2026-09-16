"use client";

import { useEffect, useState } from "react";
import Badge from "@aqarly/ui/Badge";
import Icon from "@aqarly/ui/Icon";
import ConfirmDialog from "@/components/ConfirmDialog";
import Initials from "@/components/Initials";
import StaffDialog from "@/components/StaffDialog";
import Toast from "@/components/Toast";
import { useFormAction } from "@/components/Field";
import { removeStaffAction } from "@/app/actions";
import { typeLabels } from "@aqarly/core/operations";

const GRID =
  "grid grid-cols-[minmax(0,1fr)_160px_128px_96px_72px_104px] items-center gap-3.5";

export default function StaffRows({ staff }) {
  const [editing, setEditing] = useState(null);
  const [removing, setRemoving] = useState(null);
  const [previewing, setPreviewing] = useState(null);

  const { submit, pending, result, reset } = useFormAction(removeStaffAction, {
    onSuccess: () => setRemoving(null),
  });

  function confirmRemove() {
    const form = new FormData();
    form.set("id", removing.id);
    submit(form);
  }

  return (
    <div className="min-w-[58rem] overflow-hidden rounded-md border border-border bg-surface">
      <div
        className={`${GRID} border-b border-border px-3 py-3 text-[11px] font-bold tracking-[0.1em] uppercase text-ink-muted`}
      >
        <span>Name · staff id</span>
        <span>Mobile</span>
        <span>Trade</span>
        <span className="text-center">In progress</span>
        <span className="text-center">Closed</span>
        <span className="sr-only">Actions</span>
      </div>

      <div className="divide-y divide-sunken">
        {staff.map((member) => (
          <div key={member.id} className={`${GRID} px-3 py-3.5`}>
            <span className="flex min-w-0 items-center gap-2.5">
              {member.photo ? (
                <button
                  type="button"
                  onClick={() => setPreviewing(member)}
                  aria-label={`View photo of ${member.name}`}
                  className="flex shrink-0 cursor-pointer rounded-pill transition-opacity hover:opacity-85"
                >
                  <Initials name={member.name} src={member.photo} size={34} />
                </button>
              ) : (
                <Initials name={member.name} size={34} />
              )}
              <span className="min-w-0">
                <span className="block truncate text-sm font-semibold text-ink">
                  {member.name}
                </span>
                {/* Identity is the HRMS's job from Phase 3; this stands in. */}
                <span className="block font-mono text-[11.5px] text-ink-muted">
                  {member.id}
                </span>
              </span>
            </span>

            <span className="min-w-0 truncate">
              {member.phone ? (
                <a
                  href={`tel:${member.phone.replace(/[^\d+]/g, "")}`}
                  className="font-mono text-[13px] text-ink-soft hover:text-brand"
                >
                  {member.phone}
                </a>
              ) : (
                <span className="text-[13px] text-ink-muted">—</span>
              )}
            </span>

            <span>
              <Badge tone={member.role} dot={false}>
                {typeLabels[member.role] ?? member.role}
              </Badge>
            </span>

            <span
              className={[
                "text-center font-mono text-[13px]",
                member.inProgress ? "font-semibold text-ink" : "text-ink-soft",
              ].join(" ")}
            >
              {member.inProgress}
            </span>

            <span className="text-center font-mono text-[13px] text-ink-soft">
              {member.closed}
            </span>

            <span className="flex items-center justify-end gap-1">
              <button
                type="button"
                onClick={() => setEditing(member)}
                className="cursor-pointer rounded-pill px-2.5 py-1.5 text-[13px] font-semibold text-brand transition-colors hover:bg-brand-tint"
              >
                Edit
              </button>
              <button
                type="button"
                onClick={() => {
                  reset();
                  setRemoving(member);
                }}
                aria-label={`Remove ${member.name}`}
                title={`Remove ${member.name}`}
                className="flex cursor-pointer rounded-pill p-1.5 text-ink-muted transition-colors hover:bg-danger-tint hover:text-danger"
              >
                <Icon name="trash-2" size={15} />
              </button>
            </span>
          </div>
        ))}
      </div>

      {/* Mounted per member, so the fields carry that member's values. */}
      {editing && (
        <StaffDialog open member={editing} onClose={() => setEditing(null)} />
      )}

      {previewing && (
        <PhotoPreview member={previewing} onClose={() => setPreviewing(null)} />
      )}

      <ConfirmDialog
        open={Boolean(removing)}
        onClose={() => setRemoving(null)}
        title="Remove from the roster"
        description={
          removing?.closed
            ? `${removing.name} stops being assignable. The ${removing.closed === 1 ? "one job already closed in their name stays on its request" : `${removing.closed} jobs already closed in their name stay on their requests`}.`
            : `${removing?.name ?? "This technician"} stops being assignable. Nothing has been closed in their name.`
        }
        confirmLabel="Remove"
        pending={pending}
        result={result}
        onConfirm={confirmRemove}
      />

      <Toast message={result?.ok ? result.message : null} />
    </div>
  );
}

// The row's photo at full size — the same dark overlay the request
// attachments open into, without the zoom and paging a single headshot
// has no use for.
function PhotoPreview({ member, onClose }) {
  useEffect(() => {
    function onKeyDown(event) {
      if (event.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`Photo of ${member.name}`}
      onClick={onClose}
      className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-4 bg-black/85 p-4 sm:p-10"
    >
      <button
        type="button"
        onClick={onClose}
        aria-label="Close"
        className="absolute top-4 end-4 flex cursor-pointer rounded-pill bg-white/10 p-2 text-[var(--sand-50)] transition-colors hover:bg-white/20"
      >
        <Icon name="x" size={18} />
      </button>

      {/* Inline data URL from the upload, so `next/image` has nothing to
        * optimise. */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={member.photo}
        alt={member.name}
        onClick={(event) => event.stopPropagation()}
        className="max-h-[75vh] max-w-full rounded-md object-contain shadow-lg"
      />

      <span className="text-sm font-semibold text-[var(--sand-50)]">
        {member.name}
      </span>
    </div>
  );
}
