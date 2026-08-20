const variants = {
  primary: "border-transparent bg-brand text-ink-inverse hover:bg-brand-hover",
  outline: "border-border-strong text-ink hover:bg-sunken",
  ghost: "border-transparent text-brand hover:bg-brand-tint",
};

const sizes = {
  sm: "size-8 text-sm",
  md: "size-10 text-md",
  lg: "size-12 text-lg",
};

export default function IconButton({
  variant = "outline",
  size = "md",
  disabled = false,
  label,
  className = "",
  children,
  ...props
}) {
  return (
    <button
      aria-label={label}
      title={label}
      disabled={disabled}
      className={[
        "inline-flex items-center justify-center rounded-pill border-[1.5px] transition-colors",
        sizes[size] ?? sizes.md,
        variants[variant] ?? variants.outline,
        disabled ? "cursor-not-allowed opacity-45" : "",
        className,
      ].join(" ")}
      {...props}
    >
      {children}
    </button>
  );
}
