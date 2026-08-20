import Link from "next/link";

const variants = {
  primary:
    "border-transparent bg-brand text-ink-inverse hover:bg-brand-hover active:bg-brand-active",
  outline: "border-border-strong text-ink hover:bg-sunken",
  ghost: "border-transparent text-brand hover:bg-brand-tint",
};

const sizes = {
  sm: "h-9 px-3.5 text-sm",
  md: "h-11 px-5 text-sm",
  lg: "h-13 px-7 text-base",
};

export default function Button({
  variant = "primary",
  size = "md",
  disabled = false,
  fullWidth = false,
  iconLeft,
  iconRight,
  href,
  className = "",
  children,
  ...props
}) {
  const classes = [
    "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-pill",
    "border-[1.5px] font-medium transition-colors",
    sizes[size] ?? sizes.md,
    variants[variant] ?? variants.primary,
    fullWidth ? "w-full" : "",
    disabled ? "cursor-not-allowed opacity-45" : "",
    className,
  ].join(" ");

  if (href && !disabled) {
    return (
      <Link href={href} className={classes} {...props}>
        {iconLeft}
        {children}
        {iconRight}
      </Link>
    );
  }

  return (
    <button className={classes} disabled={disabled} {...props}>
      {iconLeft}
      {children}
      {iconRight}
    </button>
  );
}
