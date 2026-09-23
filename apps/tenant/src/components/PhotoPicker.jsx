"use client";

import { useRef, useState } from "react";
import { maxRequestPhotos } from "@aqarly/core/operations";
import { Camera, X } from "./icons";

// The files stay as browser File objects on this input until the form
// around it submits — the server action reads them straight off
// `formData.getAll(name)` and inlines them, same as the ops portal's picker.
export default function PhotoPicker({ name = "photos", max = maxRequestPhotos }) {
  const input = useRef(null);
  const [photos, setPhotos] = useState([]);
  const [trimmed, setTrimmed] = useState(false);

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
      files.map((file) => ({ name: file.name, url: URL.createObjectURL(file) })),
    );
  }

  function remove(index) {
    const transfer = new DataTransfer();
    [...input.current.files].forEach((file, i) => {
      if (i !== index) transfer.items.add(file);
    });
    input.current.files = transfer.files;
    read(transfer.files);
  }

  const atLimit = photos.length >= max;

  return (
    <div className="flex flex-col gap-2">
      <input
        ref={input}
        name={name}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={(event) => read(event.target.files)}
      />

      <button
        type="button"
        onClick={() => input.current?.click()}
        disabled={atLimit}
        className="w-full cursor-pointer rounded-md border-2 border-dashed border-border bg-sunken p-6 text-center transition-colors hover:border-border-strong disabled:cursor-not-allowed disabled:opacity-60"
      >
        <Camera size={28} className="mx-auto mb-2 text-ink-soft" />
        <p className="text-sm font-semibold text-ink">
          {atLimit ? `${max} photo${max === 1 ? "" : "s"} added` : "Add photos"}
        </p>
        <p className="mt-1 text-xs text-ink-muted">
          {atLimit
            ? "Remove one below to add another"
            : `Up to ${max} photos`}
        </p>
      </button>

      {trimmed && (
        <p className="text-xs text-danger">Only the first {max} photos were kept.</p>
      )}

      {photos.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {photos.map((photo, index) => (
            <span
              key={photo.url}
              className="relative size-20 overflow-hidden rounded-md border border-border bg-surface"
            >
              {/* Local object URLs, so next/image has nothing to optimise. */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={photo.url} alt={photo.name} className="size-full object-cover" />
              <button
                type="button"
                onClick={() => remove(index)}
                aria-label={`Remove ${photo.name}`}
                className="absolute top-1 right-1 flex size-5 cursor-pointer items-center justify-center rounded-pill bg-ink/70 text-ink-inverse"
              >
                <X size={12} />
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
