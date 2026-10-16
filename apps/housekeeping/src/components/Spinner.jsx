// A small spinning arc for anything waiting on the server: inside a button
// next to its "…ing" label, or on its own for a small load. It takes the
// color of the text around it (white on a teal button, teal on a page).
// People who turn motion off see the arc standing still.
export default function Spinner({ size = 16, className = "", label }) {
  return (
    <svg
      viewBox="0 0 16 16"
      width={size}
      height={size}
      fill="none"
      role={label ? "status" : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
      className={`shrink-0 motion-safe:animate-spin ${className}`}
    >
      <circle cx="8" cy="8" r="6.5" stroke="currentColor" strokeOpacity="0.25" strokeWidth="2" />
      <path d="M8 1.5 A6.5 6.5 0 0 1 14.5 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

// A button's "…ing" label with the spinner in front of it:
// `{pending ? <Busy>Saving…</Busy> : "Save"}`.
export function Busy({ children }) {
  return (
    <span className="inline-flex items-center justify-center gap-2">
      <Spinner size={15} />
      {children}
    </span>
  );
}
