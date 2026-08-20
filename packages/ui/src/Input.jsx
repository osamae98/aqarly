export default function Input({
  label,
  error = false,
  required = false,
  id,
  className = "",
  ...props
}) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label htmlFor={id} className="text-sm font-medium text-ink">
          {label}
          {required && <span className="text-danger"> *</span>}
        </label>
      )}
      <input
        id={id}
        required={required}
        aria-invalid={error ? true : undefined}
        className={[
          "rounded-md border-[1.5px] bg-surface p-4 text-base text-ink",
          "transition-[border-color,box-shadow] placeholder:text-ink-muted",
          "focus:border-brand focus:shadow-focus focus:outline-none",
          "disabled:cursor-not-allowed disabled:opacity-60",
          error ? "border-danger" : "border-border",
          className,
        ].join(" ")}
        {...props}
      />
      {typeof error === "string" && (
        <span className="text-xs text-danger">{error}</span>
      )}
    </div>
  );
}
