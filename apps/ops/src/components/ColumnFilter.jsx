"use client";

import Link from "next/link";
import { useState } from "react";

// "Filters inside the column headers" — the header label is the trigger, and
// each option is a link, so the filter itself stays URL state.
export default function ColumnFilter({
  label,
  param,
  options,
  searchParams = {},
  align = "start",
  basePath = "/requests",
}) {
  const [open, setOpen] = useState(false);
  const params = new URLSearchParams(
    Object.entries(searchParams).filter(([, v]) => typeof v === "string"),
  );
  const active = params.get(param);
  // A filter appends its choice to the column name rather than replacing it,
  // so the header still says which column it is. The "all" option shares
  // `null` with an absent param, hence the guard.
  const chosen = active
    ? options.find((option) => option.value === active)
    : null;

  function hrefFor(value) {
    const next = new URLSearchParams(params);
    if (value === null) {
      next.delete(param);
    } else {
      next.set(param, value);
    }
    const query = next.toString();
    return query ? `${basePath}?${query}` : basePath;
  }

  return (
    <div className="relative min-w-0">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        className={[
          "flex w-full cursor-pointer items-center gap-1.5 text-[11px] font-bold tracking-[0.1em] uppercase transition-colors",
          align === "end" ? "justify-end" : "",
          chosen ? "text-brand" : "text-ink-muted hover:text-ink-soft",
        ].join(" ")}
      >
        <span className="truncate">
          {chosen ? `${label} · ${chosen.label}` : label}
        </span>
        <span className="text-[8px]">▼</span>
      </button>

      {open && (
        <>
          {/* Click-anywhere-else closes, the way the mockup's scrim does. */}
          <button
            type="button"
            aria-label="Close filter"
            onClick={() => setOpen(false)}
            className="fixed inset-0 z-10 cursor-default"
          />
          <div
            className={[
              "absolute top-6 z-20 flex w-59 flex-col gap-px rounded-md border border-border bg-surface p-1.5 shadow-lg",
              align === "end" ? "end-0" : "start-0",
            ].join(" ")}
          >
            {options.map((option) => {
              const isActive = option.value === active;

              return (
                <Link
                  key={option.label}
                  href={hrefFor(option.value)}
                  onClick={() => setOpen(false)}
                  className={[
                    "flex items-center gap-2 rounded-sm px-2.5 py-2 text-[13px] transition-colors",
                    isActive
                      ? "bg-brand-tint font-semibold text-brand"
                      : "text-ink hover:bg-page",
                  ].join(" ")}
                >
                  <span className="min-w-0 flex-1 truncate">{option.label}</span>
                  {option.count != null && (
                    <span className="font-mono text-[11.5px] text-ink-muted">
                      {option.count}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
