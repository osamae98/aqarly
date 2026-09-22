export default function SectionLabel({ className = "", children }) {
  return (
    <p
      className={`text-xs font-bold uppercase tracking-[0.08em] text-ink-muted ${className}`}
    >
      {children}
    </p>
  );
}
