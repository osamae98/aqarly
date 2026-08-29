"use client";

import { useEffect } from "react";
import Icon from "./Icon";

const widths = { sm: "max-w-[360px]", md: "max-w-[480px]", lg: "max-w-[640px]" };

// Ported from `components/feedback/Slideout.jsx`.
export default function Slideout({
  open = false,
  onClose,
  title,
  description,
  eyebrow,
  headerAction,
  footer,
  side = "end",
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
      className={[
        "fixed inset-0 z-50 flex bg-[rgb(28_23_18/0.48)] font-sans",
        side === "end" ? "justify-end" : "justify-start",
      ].join(" ")}
    >
      <div
        onClick={(event) => event.stopPropagation()}
        className={[
          "flex h-full w-full flex-col bg-surface shadow-lg",
          widths[size] ?? widths.md,
        ].join(" ")}
      >
        <div className="flex items-start gap-3 border-b border-border px-6 py-5">
          <div className="min-w-0 flex-1">
            {eyebrow && (
              <div className="mb-0.5 text-xs font-semibold tracking-[0.06em] uppercase text-ink-muted">
                {eyebrow}
              </div>
            )}
            {title && (
              <h2 className="text-lg font-semibold text-ink">{title}</h2>
            )}
            {description && (
              <p className="mt-1 text-sm text-ink-soft">{description}</p>
            )}
          </div>
          {headerAction}
          <button
            type="button"
            aria-label="Close"
            onClick={onClose}
            className="flex shrink-0 cursor-pointer p-1 text-ink-muted transition-colors hover:text-ink"
          >
            <Icon name="x" size={18} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">{children}</div>

        {footer && (
          <div className="flex justify-end gap-3 border-t border-border bg-page px-6 py-5">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}
