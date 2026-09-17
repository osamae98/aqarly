// The flat sand-toned initials disc the rows use — deliberately quieter than
// the design system's colour-hashed `Avatar`, which the mockups only use for
// the account row and the assign panel.
export default function Initials({ name = "", size = 34, tone = "sand", src = null }) {
  if (src) {
    return (
      // Inline data URLs from the upload, so `next/image` has nothing to
      // optimise.
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={src}
        alt={name}
        style={{ width: size, height: size }}
        className="shrink-0 rounded-pill object-cover"
      />
    );
  }

  const initials =
    name
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((word) => word[0]?.toUpperCase())
      .join("") || "?";

  return (
    <span
      // `size` is free-form, so the box is an inline style; colour is tokens.
      style={{ width: size, height: size, fontSize: size * 0.35 }}
      className={[
        "inline-flex shrink-0 items-center justify-center rounded-pill font-bold",
        tone === "brand"
          ? "bg-brand text-ink-inverse"
          : "bg-[var(--sand-200)] text-[var(--sand-700)]",
      ].join(" ")}
    >
      {initials}
    </span>
  );
}
