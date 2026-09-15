"use client";

import { useState } from "react";
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
  "grid grid-cols-[220px_128px_minmax(0,1fr)_72px_104px] items-center gap-3.5";

export default function StaffRows({ staff }) {
  const [editing, setEditing] = useState(null);
  const [removing, setRemoving] = useState(null);

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
        <span>Trade</span>
        <span>Buildings</span>
        <span className="text-center">Closed</span>
        <span className="sr-only">Actions</span>
      </div>

      <div className="divide-y divide-sunken">
        {staff.map((member) => (
          <div key={member.id} className={`${GRID} px-3 py-3.5`}>
            <span className="flex min-w-0 items-center gap-2.5">
              <Initials name={member.name} size={34} />
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

            <span>
              <Badge tone={member.role} dot={false}>
                {typeLabels[member.role] ?? member.role}
              </Badge>
            </span>

            <span className="min-w-0 truncate text-[13px] text-ink-soft">
              {member.properties.length
                ? member.properties.map((p) => p?.name).filter(Boolean).join(", ")
                : "No work yet"}
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
