// Label + hint wrapper for the controls the design system has no component
// for yet (textarea, the split phone input, the photo picker).
export default function Field({ label, hint, htmlFor, children }) {
  return (
    <div className="flex flex-col gap-2">
      {label && (
        <label htmlFor={htmlFor} className="text-sm font-semibold text-ink">
          {label}
        </label>
      )}
      {children}
      {hint && <p className="text-xs text-ink-muted">{hint}</p>}
    </div>
  );
}
