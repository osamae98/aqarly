"use client";

import { useEffect, useState } from "react";

// The mockup's confirmation toast: what just happened, bottom centre, gone
// again on its own. A new message re-shows it, including the same message
// twice in a row, so a repeated action still confirms itself.
export default function Toast({ message, duration = 4000 }) {
  const [shownFor, setShownFor] = useState(message);
  const [dismissed, setDismissed] = useState(false);

  if (message !== shownFor) {
    setShownFor(message);
    setDismissed(false);
  }

  useEffect(() => {
    if (!message) return;
    const timer = setTimeout(() => setDismissed(true), duration);
    return () => clearTimeout(timer);
  }, [message, duration]);

  if (!message || dismissed) return null;

  return (
    <div
      role="status"
      className="pointer-events-none fixed bottom-6 left-1/2 z-60 flex -translate-x-1/2 items-center gap-3 rounded-lg bg-ink px-5 py-3.5 text-sm font-medium text-ink-inverse shadow-lg"
    >
      <span className="flex size-5 items-center justify-center rounded-pill bg-[var(--green-400)] text-xs font-bold text-[var(--green-900)]">
        ✓
      </span>
      {message}
    </div>
  );
}
