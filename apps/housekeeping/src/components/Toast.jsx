"use client";

import { useEffect, useState } from "react";
import Icon from "@aqarly/ui/Icon";

// The mockup's confirmation toast: what just happened, top centre, gone
// again on its own or on a dismiss. A new message re-shows it, including the
// same message twice in a row, so a repeated action still confirms itself.
export default function Toast({ message, duration = 4000 }) {
  const [shownFor, setShownFor] = useState(message);
  const [dismissed, setDismissed] = useState(false);
  const [entered, setEntered] = useState(false);

  if (message !== shownFor) {
    setShownFor(message);
    setDismissed(false);
  }

  useEffect(() => {
    if (!message) return;
    setEntered(false);
    const enter = requestAnimationFrame(() => setEntered(true));
    const timer = setTimeout(() => setDismissed(true), duration);
    return () => {
      cancelAnimationFrame(enter);
      clearTimeout(timer);
    };
  }, [message, duration]);

  if (!message || dismissed) return null;

  return (
    <div
      role="status"
      className={[
        "fixed top-6 left-1/2 z-60 flex max-w-[calc(100vw-2rem)] -translate-x-1/2 items-center gap-3 rounded-lg border border-border-strong bg-ink px-4 py-3 text-sm font-medium text-ink-inverse shadow-lg transition-all duration-200",
        entered ? "translate-y-0 opacity-100" : "-translate-y-2 opacity-0",
      ].join(" ")}
    >
      <span className="flex size-5 shrink-0 items-center justify-center rounded-pill bg-[var(--green-400)] text-xs font-bold text-[var(--green-900)]">
        ✓
      </span>
      <span className="min-w-0">{message}</span>
      <button
        type="button"
        onClick={() => setDismissed(true)}
        aria-label="Dismiss"
        className="-me-1 flex shrink-0 cursor-pointer rounded-pill p-1 text-ink-inverse/70 transition-colors hover:bg-white/10 hover:text-ink-inverse"
      >
        <Icon name="x" size={14} />
      </button>
    </div>
  );
}
