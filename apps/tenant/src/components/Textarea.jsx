// Matches `@aqarly/ui/Input`'s field styling; the design system ships no
// textarea, so this lives here rather than drifting from the synced package.
export default function Textarea({ className = "", ...props }) {
  return (
    <textarea
      className={[
        "min-h-25 resize-y rounded-md border-[1.5px] border-border bg-surface p-4",
        "text-base text-ink transition-[border-color,box-shadow]",
        "placeholder:text-ink-muted",
        "focus:border-brand focus:shadow-focus focus:outline-none",
        "disabled:cursor-not-allowed disabled:opacity-60",
        className,
      ].join(" ")}
      {...props}
    />
  );
}
