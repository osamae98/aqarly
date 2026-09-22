"use client";

import { useRef, useState, useTransition } from "react";

// The field app's form controls. They are the admin portals' controls one
// size up: this is used standing on a landing with one thumb, so every target
// is at least 48px and nothing relies on a hover state.

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

export function Textarea({ label, name, placeholder, hint }) {
  return (
    <div className="flex flex-col gap-1.5">
      <Label htmlFor={name}>{label}</Label>
      <textarea
        id={name}
        name={name}
        rows={3}
        placeholder={placeholder}
        className="resize-y rounded-md border border-border bg-surface px-4 py-3 text-base text-ink transition-[border-color,box-shadow] placeholder:text-ink-muted focus:border-brand focus:shadow-focus focus:outline-none"
      />
      {hint && <p className="text-xs text-ink-muted">{hint}</p>}
    </div>
  );
}

// Evidence that the work happened. `capture` asks a phone for its camera
// rather than its gallery; a desktop browser ignores the hint and opens a
// file picker, which is what makes this clickable in the prototype at all.
export function PhotoField({ name, required, max }) {
  const input = useRef(null);
  const [photos, setPhotos] = useState([]);
  const [trimmed, setTrimmed] = useState(false);

  // The cap holds on the client too, not only when the server rejects an
  // oversized submit — a selection past `max` is trimmed here and written
  // back to the input, so what previews is exactly what will post.
  function read(fileList) {
    for (const photo of photos) URL.revokeObjectURL(photo.url);

    const files = [...fileList].slice(0, max);
    setTrimmed(fileList.length > max);

    if (fileList.length > max) {
      const transfer = new DataTransfer();
      files.forEach((file) => transfer.items.add(file));
      input.current.files = transfer.files;
    }

    setPhotos(files.map((file) => ({ name: file.name, url: URL.createObjectURL(file) })));
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

  const short = photos.length < required;

  return (
    <div className="flex flex-col gap-2.5">
      <div className="flex items-baseline justify-between gap-3">
        <Label htmlFor={name}>Photos</Label>
        <span
          className={[
            "font-mono text-xs font-semibold",
            short ? "text-danger" : "text-stage-done",
          ].join(" ")}
        >
          {photos.length} of {required} required
        </span>
      </div>

      <div className="grid grid-cols-3 gap-2.5">
        {photos.map((photo, index) => (
          <span
            key={photo.url}
            className="relative aspect-square overflow-hidden rounded-md border border-border bg-sunken"
          >
            {/* A local object URL has nothing for `next/image` to optimise. */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={photo.url} alt={photo.name} className="size-full object-cover" />
            <button
              type="button"
              onClick={() => remove(index)}
              aria-label={`Remove ${photo.name}`}
              className="absolute top-1 end-1 flex size-7 items-center justify-center rounded-pill bg-ink/70 text-sm leading-none font-bold text-ink-inverse"
            >
              ✕
            </button>
          </span>
        ))}

        {photos.length < max && (
          <label
            htmlFor={name}
            className="flex aspect-square cursor-pointer flex-col items-center justify-center gap-1 rounded-md border-2 border-dashed border-border-strong bg-surface text-ink-soft focus-within:border-brand"
          >
            <span className="text-2xl leading-none font-light">+</span>
            <span className="text-[11px] font-semibold">
              {photos.length === 0 ? "Before" : photos.length === 1 ? "After" : "Add"}
            </span>
          </label>
        )}
      </div>

      <input
        ref={input}
        id={name}
        name={name}
        type="file"
        accept="image/*"
        capture="environment"
        multiple
        onChange={(event) => read(event.target.files)}
        className="sr-only"
      />

      <p className={`text-xs ${trimmed ? "font-medium text-warning-ink" : "text-ink-muted"}`}>
        {trimmed
          ? `Only the first ${max} were kept — up to ${max} photos per job.`
          : short
            ? "A before and an after. The office and the tenant both see these."
            : `Up to ${max} photos, 2 MB each.`}
      </p>
    </div>
  );
}

// One place for what a form has to say after it runs.
export function FormNote({ state }) {
  if (!state?.error) return null;

  return (
    <p
      role="alert"
      className="rounded-md bg-danger-tint px-4 py-3 text-sm font-medium text-danger-ink"
    >
      {state.error}
    </p>
  );
}

// Server actions with the bits every screen here needs: whether it is in
// flight, what came back, and a place to react to success. Deliberately not
// `useActionState` — acting on a result belongs in the submit, not in an
// effect that fires a render later.
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
