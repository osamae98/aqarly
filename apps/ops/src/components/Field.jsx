"use client";

import { useRef, useState, useTransition } from "react";

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
  type = "text",
  placeholder,
  defaultValue,
  min,
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
        type={textarea ? undefined : type}
        required={required}
        placeholder={placeholder}
        defaultValue={defaultValue}
        min={min}
        rows={textarea ? 3 : undefined}
        className={`${control} ${textarea ? "resize-y" : ""}`}
      />
    </div>
  );
}

// A file's kind, read off what the browser reports rather than its name —
// drives both the accept filter and which preview a thumbnail gets.
function kindOf(file) {
  if (file.type.startsWith("image/")) return "image";
  if (file.type === "application/pdf") return "pdf";
  if (file.type.startsWith("video/")) return "video";
  return "other";
}

const KIND_LABEL = { pdf: "PDF", video: "Video", other: "File" };

// Attachments on a request — photos, PDFs, and short video clips — picked
// from the admin’s machine. There is no file store yet, so the files post
// with the form and the server inlines them, which is why the cap and the
// preview both live this close to the input.
export function PhotoField({
  label,
  name,
  max = 4,
  hint,
  accept = "image/*,application/pdf,video/*",
}) {
  const input = useRef(null);
  const [photos, setPhotos] = useState([]);
  const [trimmed, setTrimmed] = useState(false);

  // The cap has to hold on the client too, not just when the server rejects
  // an over-sized submit — so a selection past `max` is trimmed here, and
  // what's left is written back to the input itself, so what previews is
  // exactly what will post.
  function read(fileList) {
    for (const photo of photos) URL.revokeObjectURL(photo.url);

    const files = [...fileList].slice(0, max);
    setTrimmed(fileList.length > max);

    if (fileList.length > max) {
      const transfer = new DataTransfer();
      files.forEach((file) => transfer.items.add(file));
      input.current.files = transfer.files;
    }

    setPhotos(
      files.map((file) => ({
        name: file.name,
        url: URL.createObjectURL(file),
        kind: kindOf(file),
      })),
    );
  }

  // The input owns the files that will post, so removing one means handing it
  // a new list rather than tracking a second one alongside it.
  function remove(index) {
    const transfer = new DataTransfer();
    [...input.current.files].forEach((file, i) => {
      if (i !== index) transfer.items.add(file);
    });
    input.current.files = transfer.files;
    read(transfer.files);
  }

  return (
    <div className="flex flex-col gap-1.5">
      <Label htmlFor={name}>{label}</Label>

      <input
        ref={input}
        id={name}
        name={name}
        type="file"
        accept={accept}
        multiple={max > 1}
        onChange={(event) => read(event.target.files)}
        className="cursor-pointer rounded-sm border border-dashed border-border-strong bg-page px-3.5 py-2.5 text-[13px] text-ink-soft file:me-3 file:cursor-pointer file:rounded-pill file:border-0 file:bg-brand-tint file:px-3 file:py-1.5 file:text-[13px] file:font-semibold file:text-brand focus:border-brand focus:shadow-focus focus:outline-none"
      />

      {photos.length > 0 && (
        <div className="flex flex-wrap gap-2 pt-1">
          {photos.map((photo, index) => (
            <span
              key={photo.url}
              className="relative size-16 overflow-hidden rounded-sm border border-border bg-page"
            >
              {photo.kind === "image" ? (
                /* Local object URLs, so `next/image` has nothing to optimise. */
                /* eslint-disable-next-line @next/next/no-img-element */
                <img
                  src={photo.url}
                  alt={photo.name}
                  className="size-full object-cover"
                />
              ) : (
                <span className="flex size-full flex-col items-center justify-center gap-1 bg-sunken px-1.5 text-center">
                  <span className="text-[10px] font-bold tracking-[0.06em] text-ink-muted uppercase">
                    {KIND_LABEL[photo.kind]}
                  </span>
                  <span className="w-full truncate text-[10.5px] text-ink-soft">
                    {photo.name}
                  </span>
                </span>
              )}
              <button
                type="button"
                onClick={() => remove(index)}
                aria-label={`Remove ${photo.name}`}
                className="absolute top-0.5 end-0.5 flex size-5 cursor-pointer items-center justify-center rounded-pill bg-ink/70 text-[11px] leading-none font-bold text-ink-inverse transition-colors hover:bg-ink"
              >
                ✕
              </button>
            </span>
          ))}
        </div>
      )}

      <p className={`text-xs ${trimmed ? "font-medium text-warning-ink" : "text-ink-muted"}`}>
        {trimmed
          ? `Only the first ${max} were kept — up to ${max} attachments per request.`
          : photos.length === max
            ? `${max} of ${max} attachments selected — that's the limit.`
            : (hint ?? `Up to ${max} photos, PDFs, or videos — 2 MB each (50 MB for video).`)}
      </p>
    </div>
  );
}

// A menu long enough to scan for is a menu worth typing into. Short ones stay
// a plain list — a search box over three options is furniture.
const SEARCHABLE_FROM = 6;

// A select the admin can type into. The native control cannot be searched
// past its first letter, and these lists are buildings and units, so this is
// a listbox with a filter over it. The value still posts through a hidden
// input, so the form contract is exactly the native one's.
export function SelectField({
  label,
  name,
  options = [],
  value,
  defaultValue,
  onChange,
  placeholder = "Nothing to choose from",
  className = "",
}) {
  const [uncontrolled, setUncontrolled] = useState(
    defaultValue ?? options[0]?.value ?? "",
  );
  const [open, setOpen] = useState(false);
  const [term, setTerm] = useState("");

  // A native select falls back to its first option, and so does this — which
  // also covers the list changing under a choice that is no longer in it.
  const current = value !== undefined ? value : uncontrolled;
  const selected =
    options.find((option) => option.value === current) ?? options[0] ?? null;

  const needle = term.trim().toLowerCase();
  const matches = needle
    ? options.filter((option) => option.label.toLowerCase().includes(needle))
    : options;

  function close() {
    setOpen(false);
    setTerm("");
  }

  function pick(option) {
    if (value === undefined) setUncontrolled(option.value);
    onChange?.(option.value);
    close();
  }

  return (
    <div className={`relative flex min-w-0 flex-col gap-1.5 ${className}`}>
      <Label htmlFor={name}>{label}</Label>
      <input type="hidden" name={name} value={selected?.value ?? ""} />

      <button
        id={name}
        type="button"
        disabled={options.length === 0}
        onClick={() => (open ? close() : setOpen(true))}
        aria-haspopup="listbox"
        aria-expanded={open}
        className={`${control} flex cursor-pointer items-center gap-2 text-start disabled:cursor-not-allowed disabled:opacity-45`}
      >
        <span
          className={[
            "min-w-0 flex-1 truncate",
            selected ? "" : "text-ink-muted",
          ].join(" ")}
        >
          {selected?.label ?? placeholder}
        </span>
        <span className="shrink-0 text-[8px] text-ink-muted">▼</span>
      </button>

      {open && (
        <>
          <button
            type="button"
            aria-label="Close menu"
            onClick={close}
            className="fixed inset-0 z-10 cursor-default"
          />
          <div className="absolute top-full z-20 mt-1 flex w-full flex-col gap-px rounded-md border border-border bg-surface p-1.5 shadow-lg">
            {options.length >= SEARCHABLE_FROM && (
              <input
                type="search"
                value={term}
                autoFocus
                onChange={(event) => setTerm(event.target.value)}
                onKeyDown={(event) => event.key === "Escape" && close()}
                placeholder={`Search ${label.toLowerCase()}…`}
                aria-label={`Search ${label}`}
                className="mb-1 rounded-sm border border-border bg-page px-2.5 py-1.5 text-[13px] text-ink transition-[border-color,box-shadow] placeholder:text-ink-muted focus:border-brand focus:shadow-focus focus:outline-none"
              />
            )}

            <div role="listbox" className="flex max-h-56 flex-col gap-px overflow-y-auto">
              {matches.length === 0 && (
                <p className="px-2.5 py-3 text-center text-[13px] text-ink-muted">
                  Nothing matches &ldquo;{term}&rdquo;.
                </p>
              )}

              {matches.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  role="option"
                  aria-selected={option.value === selected?.value}
                  onClick={() => pick(option)}
                  className={[
                    "flex cursor-pointer items-center rounded-sm px-2.5 py-2 text-start text-[13px] transition-colors",
                    option.value === selected?.value
                      ? "bg-brand-tint font-semibold text-brand"
                      : "text-ink hover:bg-page",
                  ].join(" ")}
                >
                  <span className="min-w-0 flex-1 truncate">{option.label}</span>
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

// The pill row the dialogs use for a fixed choice — a real radio group, so it
// posts with the form and reaches the keyboard. Uncontrolled by default;
// pass `value`/`onChange` when another field needs to react to the choice.
export function PillChoice({
  label,
  name,
  options = [],
  value,
  defaultValue,
  onChange,
}) {
  const [uncontrolled, setUncontrolled] = useState(
    defaultValue ?? options[0]?.value,
  );
  const selected = value !== undefined ? value : uncontrolled;

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
              checked={selected === option.value}
              onChange={() => {
                if (value === undefined) setUncontrolled(option.value);
                onChange?.(option.value);
              }}
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
//
// `reset` is for the dialogs that outlive what they act on: reopening one on
// a different row must not still be showing why the last row was refused.
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

  return { submit, pending, result, reset: () => setResult(null) };
}
