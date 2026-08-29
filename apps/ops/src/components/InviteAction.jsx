"use client";

import { useState } from "react";
import Modal from "@aqarly/ui/Modal";

// "Invite to field app" — the design's QR-and-link dialog. Minting a real
// invite needs a write path and a field app to point at, so the code and the
// link are placeholders and the dialog says so.
export default function InviteAction() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="cursor-pointer rounded-pill bg-brand px-4.5 py-2.5 text-[13.5px] font-semibold text-ink-inverse transition-colors hover:bg-brand-hover"
      >
        Invite to field app
      </button>

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="Invite to field app"
        size="sm"
        footer={
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="flex-1 cursor-pointer rounded-pill border border-border-strong py-3 text-[14.5px] font-semibold text-ink-soft transition-colors hover:bg-sunken"
          >
            Done
          </button>
        }
      >
        <div className="flex flex-col items-center gap-3.5">
          <p className="text-center text-[13.5px] text-ink-soft">
            A technician scans this with their phone camera, or opens the link.
            The invite would expire after seven days.
          </p>
          <div className="flex size-40 items-center justify-center rounded-md border border-dashed border-border-strong bg-page text-xs text-ink-muted">
            QR code
          </div>
          <div className="w-full rounded-sm border border-border bg-page px-3.5 py-2.5 text-center font-mono text-[12.5px] text-ink-muted">
            No invite link yet
          </div>
          <p className="text-center text-xs text-ink-muted">
            Issuing an invite needs a write path, and the field app is a later
            phase — nothing is generated here.
          </p>
        </div>
      </Modal>
    </>
  );
}
