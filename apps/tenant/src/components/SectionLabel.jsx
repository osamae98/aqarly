export default function SectionLabel({ className = "", children }) {
  return (
    <p
      className={`text-xs font-semibold uppercase tracking-[0.05em] text-ink-soft ${className}`}
    >
      {children}
    </p>
  );
}
