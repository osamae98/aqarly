"use client";

import Link from "next/link";
import { useState } from "react";

// A menu long enough to scan for is a menu worth typing into. Short ones stay
// a plain list — a search box over three options is furniture.
const SEARCHABLE_FROM = 6;

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
  const [term, setTerm] = useState("");
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

  const searchable = options.length >= SEARCHABLE_FROM;
  const needle = term.trim().toLowerCase();
  const matches = needle
    ? options.filter((option) => option.label.toLowerCase().includes(needle))
    : options;

  function close() {
    setOpen(false);
    setTerm("");
  }

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
        onClick={() => (open ? close() : setOpen(true))}
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
            onClick={close}
            className="fixed inset-0 z-10 cursor-default"
          />
          <div
            className={[
              "absolute top-6 z-20 flex w-59 flex-col gap-px rounded-md border border-border bg-surface p-1.5 shadow-lg",
              align === "end" ? "end-0" : "start-0",
            ].join(" ")}
          >
            {searchable && (
              <input
                type="search"
                value={term}
                autoFocus
                onChange={(event) => setTerm(event.target.value)}
                onKeyDown={(event) => event.key === "Escape" && close()}
                placeholder={`Search ${label.toLowerCase()}…`}
                aria-label={`Search ${label}`}
                className="mb-1 rounded-sm border border-border bg-page px-2.5 py-1.5 text-[13px] font-normal tracking-normal normal-case text-ink transition-[border-color,box-shadow] placeholder:text-ink-muted focus:border-brand focus:shadow-focus focus:outline-none"
              />
            )}

            <div className="flex max-h-64 flex-col gap-px overflow-y-auto">
              {matches.length === 0 && (
                <p className="px-2.5 py-3 text-center text-[13px] font-normal tracking-normal normal-case text-ink-muted">
                  Nothing matches “{term}”.
                </p>
              )}

              {matches.map((option) => {
                const isActive = option.value === active;

                return (
                  <Link
                    key={option.label}
                    href={hrefFor(option.value)}
                    onClick={close}
                    className={[
                      "flex items-center gap-2 rounded-sm px-2.5 py-2 text-[13px] font-normal tracking-normal normal-case transition-colors",
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
          </div>
        </>
      )}
    </div>
  );
}
