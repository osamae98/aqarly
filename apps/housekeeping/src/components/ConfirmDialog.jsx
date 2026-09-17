"use client";

import Modal from "@aqarly/ui/Modal";
import { FormNote } from "@/components/Field";

// One dialog for every removal in the portal. Nothing here is recoverable —
// the store has no archive and no undo — so the copy says what goes and the
// confirming button carries the danger tone rather than the brand one.
export default function ConfirmDialog({
  open,
  onClose,
  title,
  description,
  confirmLabel = "Remove",
  pending = false,
  result,
  onConfirm,
}) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title={title}
      size="sm"
      footer={
        <>
          <button
            type="button"
            onClick={onConfirm}
            disabled={pending}
            className="flex-1 cursor-pointer rounded-pill bg-danger py-3 text-[14.5px] font-semibold text-ink-inverse transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-45"
          >
            {pending ? "Removing…" : confirmLabel}
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
      <div className="flex flex-col gap-2.5">
        <p className="text-[14.5px] leading-relaxed text-ink-soft">
          {description}
        </p>
        <p className="text-xs text-ink-muted">
          Writes live in the server process, so &ldquo;Reset demo data&rdquo; in
          the sidebar is the only way back.
        </p>
        <FormNote state={result} />
      </div>
    </Modal>
  );
}
