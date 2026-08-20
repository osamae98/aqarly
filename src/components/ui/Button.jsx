import Link from "next/link";

const variants = {
  primary:
    "bg-foreground text-background hover:opacity-90",
  outline:
    "border border-black/15 hover:bg-black/5 dark:border-white/20 dark:hover:bg-white/10",
};

export default function Button({
  href,
  variant = "primary",
  className = "",
  children,
  ...props
}) {
  const classes = `inline-flex h-10 items-center justify-center rounded-md px-4 text-sm font-medium transition ${variants[variant]} ${className}`;

  if (href) {
    return (
      <Link href={href} className={classes} {...props}>
        {children}
      </Link>
    );
  }

  return (
    <button className={classes} {...props}>
      {children}
    </button>
  );
}
