// Gap keys mirror the design system's --space-* token names.
const gaps = {
  1: "gap-1",
  2: "gap-2",
  3: "gap-3",
  4: "gap-4",
  5: "gap-5",
  6: "gap-6",
  8: "gap-8",
  10: "gap-10",
  12: "gap-12",
  16: "gap-16",
};

export default function Stack({
  direction = "vertical",
  gap = 4,
  className = "",
  children,
}) {
  return (
    <div
      className={[
        "flex",
        direction === "horizontal"
          ? "flex-row items-center"
          : "flex-col items-stretch",
        gaps[gap] ?? gaps[4],
        className,
      ].join(" ")}
    >
      {children}
    </div>
  );
}
