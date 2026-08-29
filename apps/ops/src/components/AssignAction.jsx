"use client";

import { useState } from "react";
import AssignPanel from "@/components/AssignPanel";

// The Assign button and its panel — the only client state on the detail page.
export default function AssignAction({ candidates, assigned, note }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="cursor-pointer rounded-pill bg-brand px-4.5 py-2.5 text-[13.5px] font-bold text-ink-inverse transition-colors hover:bg-brand-hover"
      >
        {assigned ? "Reassign" : "Assign"}
      </button>
      <AssignPanel
        open={open}
        onClose={() => setOpen(false)}
        candidates={candidates}
        title={assigned ? "Reassign this request" : "Assign this request"}
        description="Ranked by trade, who is already working the building, and how loaded their day is."
        note={note}
      />
    </>
  );
}
