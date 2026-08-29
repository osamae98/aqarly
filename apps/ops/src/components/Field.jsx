"use client";

import { useState, useTransition } from "react";

// The form controls the mockups' dialogs are drawn with: a micro-label over a
// bordered control. `@aqarly/ui/Input` is the design system's own field and
// carries its own type scale; these match the dialogs, which sit a size down.

const control =
  "rounded-sm border border-border bg-surface px-3.5 py-2.5 text-sm text-ink transition-[border-color,box-shadow] placeholder:text-ink-muted focus:border-brand focus:shadow-focus focus:outline-none";

export function Label({ htmlFor, children }) {
  return (
    <label
      htmlFor={htmlFor}
      className="text-xs font-bold tracking-[0.08em] uppercase text-ink-muted"
    >
      {children}
    </label>
  );
}

export function TextField({
  label,
  name,
  placeholder,
  defaultValue,
  required = false,
  textarea = false,
  className = "",
}) {
  const Element = textarea ? "textarea" : "input";

  return (
    <div className={`flex min-w-0 flex-col gap-1.5 ${className}`}>
      <Label htmlFor={name}>{label}</Label>
      <Element
        id={name}
        name={name}
        required={required}
        placeholder={placeholder}
        defaultValue={defaultValue}
        rows={textarea ? 3 : undefined}
        className={`${control} ${textarea ? "resize-y" : ""}`}
      />
    </div>
  );
}

export function SelectField({
  label,
  name,
  options = [],
  value,
  defaultValue,
  onChange,
  className = "",
}) {
  return (
    <div className={`flex min-w-0 flex-col gap-1.5 ${className}`}>
      <Label htmlFor={name}>{label}</Label>
      <select
        id={name}
        name={name}
        value={value}
        defaultValue={defaultValue}
        onChange={onChange}
        className={`${control} cursor-pointer`}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}

// The pill row the dialogs use for a fixed choice — a real radio group, so it
// posts with the form and reaches the keyboard.
export function PillChoice({ label, name, options = [], defaultValue }) {
  const selected = defaultValue ?? options[0]?.value;

  return (
    <div className="flex flex-col gap-1.5">
      <Label>{label}</Label>
      <div className="flex flex-wrap gap-2">
        {options.map((option) => (
          <label key={option.value} className="cursor-pointer">
            <input
              type="radio"
              name={name}
              value={option.value}
              aria-label={option.label}
              defaultChecked={option.value === selected}
              className="peer sr-only"
            />
            <span className="inline-flex rounded-pill border border-border-strong px-3.5 py-1.5 text-[13px] font-semibold text-ink-soft transition-colors peer-checked:border-[1.5px] peer-checked:border-brand peer-checked:bg-brand-tint peer-checked:font-bold peer-checked:text-brand peer-focus-visible:shadow-focus">
              {option.label}
            </span>
          </label>
        ))}
      </div>
    </div>
  );
}

// One place for what a form has to say after it runs.
export function FormNote({ state }) {
  if (!state?.error) return null;

  return (
    <p role="alert" className="text-[13px] font-medium text-danger">
      {state.error}
    </p>
  );
}

// Server actions with the bits every dialog here needs: whether it is in
// flight, what came back, and a place to react to success. Deliberately not
// `useActionState` — closing a dialog from its result belongs in the submit,
// not in an effect that fires a render later.
export function useFormAction(action, { onSuccess } = {}) {
  const [pending, startTransition] = useTransition();
  const [result, setResult] = useState(null);

  function submit(formData) {
    startTransition(async () => {
      const next = await action(formData);
      setResult(next);
      if (next?.ok) onSuccess?.(next);
    });
  }

  return { submit, pending, result };
}
