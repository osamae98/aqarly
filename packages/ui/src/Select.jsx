export default function Select({
  label,
  options = [],
  error = false,
  required = false,
  placeholder,
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
      <select
        id={id}
        required={required}
        aria-invalid={error ? true : undefined}
        className={[
          "cursor-pointer rounded-md border-[1.5px] bg-surface p-4 text-base text-ink",
          "transition-[border-color,box-shadow]",
          "focus:border-brand focus:shadow-focus focus:outline-none",
          "disabled:cursor-not-allowed disabled:opacity-60",
          error ? "border-danger" : "border-border",
          className,
        ].join(" ")}
        {...props}
      >
        {placeholder && (
          <option value="" disabled hidden>
            {placeholder}
          </option>
        )}
        {options.map((option) => {
          const value = typeof option === "string" ? option : option.value;
          const optionLabel =
            typeof option === "string" ? option : option.label;
          return (
            <option key={value} value={value}>
              {optionLabel}
            </option>
          );
        })}
      </select>
      {typeof error === "string" && (
        <span className="text-xs text-danger">{error}</span>
      )}
    </div>
  );
}
