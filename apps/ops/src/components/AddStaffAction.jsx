"use client";

import { useState } from "react";
import StaffDialog from "@/components/StaffDialog";

// The roster's own "add" — a real write, unlike the field-app invite next to
// it, which still has nothing to invite anyone to.
export default function AddStaffAction() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="cursor-pointer rounded-pill border border-border-strong px-4 py-2 text-[13.5px] font-semibold text-ink-soft transition-colors hover:bg-sunken"
      >
        Add technician
      </button>

      {/* Mounted per opening, so the form and whatever the last attempt said
        * both start clean. */}
      {open && <StaffDialog open onClose={() => setOpen(false)} />}
    </>
  );
}
