// Deterministic accent per name, drawn from the design system's raw scales.
const palette = [
  "bg-[var(--green-600)]",
  "bg-[var(--sky-500)]",
  "bg-[var(--terracotta-500)]",
  "bg-[var(--amber-500)]",
  "bg-[var(--sand-600)]",
];

function hash(str) {
  let h = 0;
  for (let i = 0; i < str.length; i++) {
    h = (h * 31 + str.charCodeAt(i)) | 0;
  }
  return Math.abs(h);
}

export default function Avatar({ name = "", size = 40, className = "" }) {
  const initials =
    name
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((word) => word[0]?.toUpperCase())
      .join("") || "?";

  return (
    <div
      // `size` is a free-form number, so the box has to be an inline style —
      // every colour still comes from a token.
      style={{ width: size, height: size, fontSize: size * 0.4 }}
      className={[
        "inline-flex shrink-0 items-center justify-center rounded-pill",
        "font-semibold text-ink-inverse",
        palette[hash(name) % palette.length],
        className,
      ].join(" ")}
    >
      {initials}
    </div>
  );
}
