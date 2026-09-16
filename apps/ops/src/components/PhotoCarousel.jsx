"use client";

import { useEffect, useRef, useState } from "react";
import Icon from "@aqarly/ui/Icon";

const ZOOM_MIN = 1;
const ZOOM_MAX = 3;
const ZOOM_STEP = 0.25;

// A file's kind read off its own data URL — the upload never stored a
// separate mime field, and the prefix already carries it, so there is
// nothing new to keep in sync.
function kindOf(dataUrl) {
  if (dataUrl.startsWith("data:image/")) return "image";
  if (dataUrl.startsWith("data:application/pdf")) return "pdf";
  if (dataUrl.startsWith("data:video/")) return "video";
  return "other";
}

const KIND_ICON = { pdf: "file-text", video: "camera", other: "file-text" };
const KIND_LABEL = { pdf: "PDF", video: "Video", other: "File" };

// The thumbnails a request's attachments already rendered as, now opening
// into a full-screen viewer — zoom and pan for a photo, the browser's own
// viewer for a PDF or a clip, since neither needs a custom one built for it.
export default function PhotoCarousel({ photos = [] }) {
  const [index, setIndex] = useState(null);
  const [zoom, setZoom] = useState(1);
  const [fullscreen, setFullscreen] = useState(false);
  const [videoError, setVideoError] = useState(false);
  const viewerRef = useRef(null);
  const open = index !== null;
  const current = open ? photos[index] : null;
  const kind = current ? kindOf(current.dataUrl) : null;

  // A codec the browser can't decode (an iPhone .mov clip is the usual
  // culprit) leaves the <video> sitting frozen with no visible error, so the
  // viewer needs to notice for itself and offer the download fallback below.
  useEffect(() => {
    setVideoError(false);
  }, [current]);

  useEffect(() => {
    if (!open) return;

    function onKeyDown(event) {
      if (event.key === "Escape") setIndex(null);
      if (event.key === "ArrowRight") step(1);
      if (event.key === "ArrowLeft") step(-1);
    }

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, photos.length]);

  useEffect(() => {
    function onFullscreenChange() {
      setFullscreen(Boolean(document.fullscreenElement));
    }
    document.addEventListener("fullscreenchange", onFullscreenChange);
    return () =>
      document.removeEventListener("fullscreenchange", onFullscreenChange);
  }, []);

  if (!photos.length) {
    return (
      <p className="mt-3 text-xs text-ink-muted">
        Photos, PDFs, and short videos can be attached when a request is
        raised here; the tenant portal has no upload path yet, so nothing is
        attached to this one.
      </p>
    );
  }

  function step(delta) {
    setZoom(1);
    setIndex((current) => (current + delta + photos.length) % photos.length);
  }

  function openAt(i) {
    setZoom(1);
    setIndex(i);
  }

  function close() {
    if (document.fullscreenElement) document.exitFullscreen();
    setIndex(null);
  }

  function toggleFullscreen() {
    if (document.fullscreenElement) {
      document.exitFullscreen();
    } else {
      viewerRef.current?.requestFullscreen?.();
    }
  }

  return (
    <>
      <div className="mt-3.5 flex flex-wrap gap-2.5">
        {photos.map((photo, i) => {
          const photoKind = kindOf(photo.dataUrl);
          return (
            <button
              key={photo.dataUrl}
              type="button"
              onClick={() => openAt(i)}
              aria-label={`View ${photo.name}`}
              className="flex size-28 cursor-pointer flex-col items-center justify-center overflow-hidden rounded-sm border border-border bg-sunken transition-opacity hover:opacity-85"
            >
              {photoKind === "image" ? (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img
                  src={photo.dataUrl}
                  alt={photo.name}
                  className="size-full object-cover"
                />
              ) : (
                <span className="flex flex-col items-center gap-1.5 px-2 text-center">
                  <Icon
                    name={KIND_ICON[photoKind]}
                    size={22}
                    className="text-ink-muted"
                  />
                  <span className="text-[10px] font-bold tracking-[0.06em] text-ink-muted uppercase">
                    {KIND_LABEL[photoKind]}
                  </span>
                  <span className="w-full truncate text-[10.5px] text-ink-soft">
                    {photo.name}
                  </span>
                </span>
              )}
            </button>
          );
        })}
      </div>

      {open && (
        <div
          ref={viewerRef}
          role="dialog"
          aria-modal="true"
          aria-label={`${KIND_LABEL[kind] ?? "Photo"} ${index + 1} of ${photos.length}`}
          onClick={close}
          className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-4 bg-black/85 p-4 sm:p-10"
        >
          <div className="absolute top-4 end-4 flex items-center gap-2">
            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                toggleFullscreen();
              }}
              aria-label={fullscreen ? "Exit full screen" : "Full screen"}
              title={fullscreen ? "Exit full screen" : "Full screen"}
              className="flex cursor-pointer rounded-pill bg-white/10 p-2 text-[var(--sand-50)] transition-colors hover:bg-white/20"
            >
              <MaximizeIcon exit={fullscreen} />
            </button>
            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                close();
              }}
              aria-label="Close"
              className="flex cursor-pointer rounded-pill bg-white/10 p-2 text-[var(--sand-50)] transition-colors hover:bg-white/20"
            >
              <Icon name="x" size={18} />
            </button>
          </div>

          {photos.length > 1 && (
            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                step(-1);
              }}
              aria-label="Previous"
              className="absolute start-2 top-1/2 flex -translate-y-1/2 cursor-pointer rounded-pill bg-white/10 p-2.5 text-[var(--sand-50)] transition-colors hover:bg-white/20 sm:start-4"
            >
              <Icon name="chevron-right" size={20} className="rotate-180" />
            </button>
          )}

          {kind === "image" ? (
            <div
              onClick={(event) => event.stopPropagation()}
              className="flex max-h-[75vh] max-w-full items-center justify-center overflow-auto rounded-md"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={current.dataUrl}
                alt={current.name}
                draggable={false}
                style={{ transform: `scale(${zoom})` }}
                className="max-h-[75vh] max-w-full origin-center select-none object-contain shadow-lg transition-transform"
              />
            </div>
          ) : kind === "video" && !videoError ? (
            <video
              key={current.dataUrl}
              src={current.dataUrl}
              controls
              autoPlay
              onClick={(event) => event.stopPropagation()}
              onError={() => setVideoError(true)}
              className="max-h-[75vh] max-w-full rounded-md shadow-lg"
            />
          ) : kind === "video" ? (
            <div
              onClick={(event) => event.stopPropagation()}
              className="flex w-full max-w-md flex-col items-center gap-3 rounded-md bg-surface p-8 text-center shadow-lg"
            >
              <Icon name="camera" size={28} className="text-ink-muted" />
              <p className="text-sm text-ink">
                This browser can&rsquo;t play {current.name} — its format
                isn&rsquo;t supported for inline playback.
              </p>
              <a
                href={current.dataUrl}
                download={current.name}
                className="rounded-pill bg-brand px-4 py-2 text-[13px] font-semibold text-ink-inverse hover:bg-brand-hover"
              >
                Download {current.name}
              </a>
            </div>
          ) : (
            <div
              onClick={(event) => event.stopPropagation()}
              className="flex h-[75vh] w-full max-w-3xl flex-col overflow-hidden rounded-md bg-surface shadow-lg"
            >
              <iframe src={current.dataUrl} title={current.name} className="flex-1" />
              <a
                href={current.dataUrl}
                download={current.name}
                className="border-t border-border px-4 py-2.5 text-center text-[13px] font-semibold text-brand hover:underline"
              >
                Open {current.name} in a new tab
              </a>
            </div>
          )}

          {photos.length > 1 && (
            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                step(1);
              }}
              aria-label="Next"
              className="absolute end-2 top-1/2 flex -translate-y-1/2 cursor-pointer rounded-pill bg-white/10 p-2.5 text-[var(--sand-50)] transition-colors hover:bg-white/20 sm:end-4"
            >
              <Icon name="chevron-right" size={20} />
            </button>
          )}

          <div
            onClick={(event) => event.stopPropagation()}
            className="flex flex-wrap items-center justify-center gap-4"
          >
            {kind === "image" && (
              <div className="flex items-center gap-2.5">
                <button
                  type="button"
                  onClick={() => setZoom((z) => Math.max(ZOOM_MIN, z - ZOOM_STEP))}
                  disabled={zoom <= ZOOM_MIN}
                  aria-label="Zoom out"
                  className="flex cursor-pointer rounded-pill bg-white/10 p-1.5 text-[var(--sand-50)] transition-colors hover:bg-white/20 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <span className="flex size-4 items-center justify-center text-base leading-none">
                    −
                  </span>
                </button>
                <input
                  type="range"
                  min={ZOOM_MIN}
                  max={ZOOM_MAX}
                  step={ZOOM_STEP}
                  value={zoom}
                  onChange={(event) => setZoom(Number(event.target.value))}
                  aria-label="Zoom"
                  className="h-1 w-28 cursor-pointer accent-[var(--sand-50)]"
                />
                <button
                  type="button"
                  onClick={() => setZoom((z) => Math.min(ZOOM_MAX, z + ZOOM_STEP))}
                  disabled={zoom >= ZOOM_MAX}
                  aria-label="Zoom in"
                  className="flex cursor-pointer rounded-pill bg-white/10 p-1.5 text-[var(--sand-50)] transition-colors hover:bg-white/20 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <span className="flex size-4 items-center justify-center text-base leading-none">
                    +
                  </span>
                </button>
                <span className="w-10 font-mono text-[12px] text-[var(--sand-50)]">
                  {Math.round(zoom * 100)}%
                </span>
              </div>
            )}

            <span className="font-mono text-[12.5px] text-[var(--sand-50)]">
              {index + 1} / {photos.length}
            </span>

            {photos.length > 1 && (
              <div className="flex gap-1.5">
                {photos.map((photo, i) => (
                  <button
                    key={photo.dataUrl}
                    type="button"
                    onClick={() => openAt(i)}
                    aria-label={`Go to item ${i + 1}`}
                    aria-current={i === index}
                    className={[
                      "size-1.5 cursor-pointer rounded-pill transition-colors",
                      i === index
                        ? "bg-[var(--sand-50)]"
                        : "bg-white/30 hover:bg-white/50",
                    ].join(" ")}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}

// No "maximize" glyph in the shared icon set yet — four corner brackets is
// the universal one, cheap enough to draw inline rather than add there for
// a single caller.
function MaximizeIcon({ exit }) {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {exit ? (
        <path d="M9 3v4a2 2 0 0 1-2 2H3M21 9h-4a2 2 0 0 1-2-2V3M3 15h4a2 2 0 0 1 2 2v4M15 21v-4a2 2 0 0 1 2-2h4" />
      ) : (
        <path d="M8 3H5a2 2 0 0 0-2 2v3M16 3h3a2 2 0 0 1 2 2v3M21 16v3a2 2 0 0 1-2 2h-3M3 16v3a2 2 0 0 0 2 2h3" />
      )}
    </svg>
  );
}
