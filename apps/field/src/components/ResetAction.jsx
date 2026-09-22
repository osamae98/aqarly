"use client";

import { useTransition } from "react";
import { resetAction } from "@/app/actions";

// The prototype's data lives in one process, so this is the way back to a
// known state after clicking through a day's work. The ops portal's sidebar
// carries the same control for the same reason.
export default function ResetAction() {
  const [pending, startTransition] = useTransition();

  return (
    <button
      type="button"
      disabled={pending}
      onClick={() => startTransition(() => resetAction())}
      className="self-center text-xs font-medium text-ink-muted underline underline-offset-4 disabled:opacity-50"
    >
      {pending ? "Resetting…" : "Reset demo data"}
    </button>
  );
}
