"use client";

import { useEffect } from "react";
import Icon from "./Icon";

const widths = { sm: "max-w-[400px]", md: "max-w-[460px]", lg: "max-w-[520px]" };

// The centred dialog the mockups use for the short flows that do not deserve
// a whole screen — a new rate, an invite, a replacement request. `Slideout`
// stays the pattern for anything that has to sit beside the record it acts on.
export default function Modal({
  open = false,
  onClose,
  title,
  description,
  footer,
  size = "md",
  children,
}) {
  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event) => {
      if (event.key === "Escape") onClose?.();
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={title}
      onClick={() => onClose?.()}
      className="fixed inset-0 z-50 flex items-center justify-center bg-[rgb(28_23_18/0.32)] p-4 font-sans"
    >
      <div
        onClick={(event) => event.stopPropagation()}
        className={[
          "flex max-h-full w-full flex-col rounded-lg bg-surface shadow-lg",
          widths[size] ?? widths.md,
        ].join(" ")}
      >
        <div className="flex flex-col gap-1 border-b border-border px-6 py-5">
          <div className="flex items-center gap-2.5">
            <h2 className="min-w-0 flex-1 text-lg font-bold text-ink">
              {title}
            </h2>
            <button
              type="button"
              aria-label="Close"
              onClick={onClose}
              className="flex shrink-0 cursor-pointer rounded-pill p-1 text-ink-muted transition-colors hover:bg-page hover:text-ink"
            >
              <Icon name="x" size={16} />
            </button>
          </div>
          {description && (
            <p className="text-[13px] text-ink-soft">{description}</p>
          )}
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-5">{children}</div>

        {footer && (
          <div className="flex items-center gap-3 border-t border-border px-6 py-4">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}
