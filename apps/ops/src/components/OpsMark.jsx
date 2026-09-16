// The operations mark keeps the wordmark's A, but gives it a small roofline
// so it still reads as a property product when the label is not visible.
export default function OpsMark({ className = "" }) {
  return (
    <svg
      viewBox="0 0 28 28"
      aria-hidden="true"
      className={`block ${className}`}
      fill="none"
    >
      <rect width="28" height="28" rx="6" fill="var(--green-400)" />
      <path
        d="M7.4 19.6 12.7 8.2c.5-1.1 2.1-1.1 2.6 0l5.3 11.4h-3.1l-1.1-2.5h-4.8l-1.1 2.5H7.4Zm5.3-5.2h2.6L14 11.3l-1.3 3.1Z"
        fill="var(--green-900)"
      />
    </svg>
  );
}
