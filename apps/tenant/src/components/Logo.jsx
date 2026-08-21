// Solid house silhouette with the wordmark's initial cut out of it, from the
// design file's sign-in screen.
export default function Logo({ size = 84, className = "" }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 84 84"
      aria-hidden="true"
      className={className}
    >
      <path
        className="fill-brand"
        d="M 42 10 L 74 40 Q 76 42 74 45 L 68 45 L 68 62 Q 68 74 56 74 L 28 74 Q 16 74 16 62 L 16 45 L 10 45 Q 8 42 10 40 Z"
      />
      <path
        className="fill-page"
        fillRule="evenodd"
        d="M 42 30 L 56 62 L 48 62 L 45.5 55 L 38.5 55 L 36 62 L 28 62 Z M 41 42 L 39.7 46 L 43 46 Z"
      />
    </svg>
  );
}
