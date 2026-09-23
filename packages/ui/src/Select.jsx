"use client";

import { useEffect, useId, useRef, useState } from "react";
import Icon from "./Icon";

export default function Select({
  label,
  options = [],
  error = false,
  required = false,
  placeholder,
  disabled = false,
  id,
  name,
  defaultValue,
  onChange,
  className = "",
}) {
  const generatedId = useId();
  const selectId = id ?? generatedId;
  const normalized = options.map((option) =>
    typeof option === "string" ? { value: option, label: option } : option,
  );

  // Mirrors a native <select>: with no placeholder there is no empty slot,
  // so the first option is already the selected one.
  const initial = defaultValue ?? (placeholder ? "" : normalized[0]?.value ?? "");
  const [value, setValue] = useState(initial);
  const [open, setOpen] = useState(false);
  const rootRef = useRef(null);

  useEffect(() => {
    if (!open) return;
    function onPointerDown(event) {
      if (!rootRef.current?.contains(event.target)) setOpen(false);
    }
    function onKeyDown(event) {
      if (event.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  const selected = normalized.find((option) => option.value === value);

  function select(option) {
    setValue(option.value);
    setOpen(false);
    onChange?.(option.value);
  }

  return (
    <div className="flex flex-col gap-1.5" ref={rootRef}>
      {label && (
        <label htmlFor={selectId} className="text-sm font-medium text-ink">
          {label}
          {required && <span className="text-danger"> *</span>}
        </label>
      )}

      <div className="relative">
        <button
          type="button"
          id={selectId}
          disabled={disabled}
          aria-haspopup="listbox"
          aria-expanded={open}
          onClick={() => setOpen((isOpen) => !isOpen)}
          className={[
            "flex w-full items-center justify-between gap-2 rounded-md border-[1.5px] bg-surface p-4 text-left text-base",
            "transition-[border-color,box-shadow]",
            "focus:border-brand focus:shadow-focus focus:outline-none",
            "disabled:cursor-not-allowed disabled:opacity-60",
            error ? "border-danger" : "border-border",
            className,
          ].join(" ")}
        >
          <span className={selected ? "text-ink" : "text-ink-muted"}>
            {selected ? selected.label : placeholder}
          </span>
          <Icon
            name="chevron-down"
            size={18}
            className={`shrink-0 text-ink-muted transition-transform ${open ? "rotate-180" : ""}`}
          />
        </button>

        {open && (
          <ul
            role="listbox"
            tabIndex={-1}
            className="absolute z-20 mt-1.5 max-h-60 w-full overflow-auto rounded-md border border-border bg-surface p-1.5 shadow-lg"
          >
            {normalized.map((option) => (
              <li key={option.value}>
                <button
                  type="button"
                  role="option"
                  aria-selected={option.value === value}
                  onClick={() => select(option)}
                  className={[
                    "block w-full rounded-sm px-3 py-2.5 text-left text-sm",
                    option.value === value
                      ? "bg-brand-tint font-semibold text-brand"
                      : "text-ink hover:bg-sunken",
                  ].join(" ")}
                >
                  {option.label}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {name && <input type="hidden" name={name} value={value} />}
      {typeof error === "string" && (
        <span className="text-xs text-danger">{error}</span>
      )}
    </div>
  );
}
