import Icon from "./Icon";

// Ported from `components/core/Tag.jsx` — the bordered chip used for filters,
// as distinct from `Badge`, which states a status.
const tones = {
  neutral: "border-border bg-sunken text-ink-soft",
  brand: "border-[var(--green-200)] bg-brand-tint text-brand",
  maintenance:
    "border-[var(--terracotta-300)] bg-category-maintenance-tint text-category-maintenance",
  housekeeping:
    "border-[var(--sky-300)] bg-category-housekeeping-tint text-category-housekeeping",
};

const sizes = { sm: "h-6 text-xs", md: "h-[30px] text-sm" };

export default function Tag({
  tone = "neutral",
  size = "md",
  icon,
  selected = false,
  href,
  className = "",
  children,
  ...props
}) {
  const classes = [
    "inline-flex items-center gap-2 rounded-pill border ps-3 pe-3 font-medium transition-colors",
    sizes[size] ?? sizes.md,
    selected
      ? "border-brand bg-brand text-ink-inverse"
      : (tones[tone] ?? tones.neutral),
    className,
  ].join(" ");

  const inner = (
    <>
      {icon && <Icon name={icon} size={size === "sm" ? 12 : 14} />}
      {children}
    </>
  );

  const Element = href ? "a" : "span";

  return (
    <Element href={href} className={classes} {...props}>
      {inner}
    </Element>
  );
}
