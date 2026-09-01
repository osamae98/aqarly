"use client";

import { useState } from "react";
import Icon from "@aqarly/ui/Icon";

// The banner the queue leads with when something cannot wait. It can be put
// away, but only for the current view — there is nowhere to store a dismissal,
// so anything still unassigned is back on the next load, and a change in what
// it is reporting brings it back straight away.
export default function DismissAlert({ signature, children }) {
  const [dismissed, setDismissed] = useState(null);

  if (dismissed === signature) return null;

  return (
    <div className="bg-surface px-4 pt-4 pb-5 md:px-6">
      <div className="flex flex-wrap items-center gap-3 rounded-md border border-[var(--amber-300)] bg-warning-tint px-4.5 py-3.5">
        <span className="flex size-4.5 shrink-0 items-center justify-center rounded-pill border-[1.5px] border-warning-ink text-[11px] leading-none font-bold text-warning-ink">
          !
        </span>
        {children}
        <button
          type="button"
          onClick={() => setDismissed(signature)}
          aria-label="Dismiss this alert"
          className="flex shrink-0 cursor-pointer rounded-pill p-1 text-warning-ink opacity-65 transition-opacity hover:opacity-100"
        >
          <Icon name="x" size={15} />
        </button>
      </div>
    </div>
  );
}
