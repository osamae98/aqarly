// Placeholders shown while a page loads (the `loading.js` files under
// app/(portal)), drawn in the shape of what's coming so nothing jumps when it
// arrives. A soft light sweeps across them (`.skeleton` in globals.css);
// people who turn motion off see them still.

// One gray block. Size it with classes: `<Bone className="h-3 w-40" />`.
export function Bone({ className = "" }) {
  return <span aria-hidden className={`skeleton block rounded-sm ${className}`} />;
}

// The white band every screen opens with: a title, a line under it, and
// room for the screen's buttons.
export function PageBarSkeleton({ actions = 1 }) {
  return (
    <div className="flex flex-wrap items-start gap-4 border-b border-border bg-surface px-4 py-4 md:px-6">
      <div className="flex min-w-0 flex-1 flex-col gap-2.5">
        <Bone className="h-6 w-56" />
        <Bone className="h-3 w-36" />
      </div>
      {Array.from({ length: actions }, (_, i) => (
        <Bone key={i} className="h-10 w-32 rounded-md" />
      ))}
    </div>
  );
}

// A table: a header strip and rows of cells, each row starting with a
// circle when the real rows lead with an avatar or checkbox.
export function TableSkeleton({ rows = 6, columns = 5, lead = true }) {
  return (
    <div className="overflow-hidden rounded-md border border-border bg-surface">
      <div className="flex items-center gap-6 border-b border-border px-4 py-3.5">
        {Array.from({ length: columns }, (_, i) => (
          <Bone key={i} className={`h-2.5 ${i === 1 ? "w-32" : "w-16"}`} />
        ))}
      </div>
      <div className="divide-y divide-sunken">
        {Array.from({ length: rows }, (_, row) => (
          <div key={row} className="flex items-center gap-6 px-4 py-4">
            {lead && <Bone className="size-7 shrink-0 rounded-pill" />}
            <Bone className={`h-3 ${["w-48", "w-40", "w-56", "w-36"][row % 4]}`} />
            <Bone className="h-3 w-24" />
            <Bone className="hidden h-5 w-20 rounded-pill sm:block" />
            <Bone className="ms-auto hidden h-3 w-20 md:block" />
          </div>
        ))}
      </div>
    </div>
  );
}

// A grid of cards, like the buildings or a unit's open work.
export function CardGridSkeleton({ cards = 6 }) {
  return (
    <div className="grid gap-3.5 sm:grid-cols-2 xl:grid-cols-3">
      {Array.from({ length: cards }, (_, i) => (
        <div key={i} className="flex flex-col gap-3.5 rounded-md border border-border bg-surface p-4">
          <Bone className="h-4 w-40" />
          <Bone className="h-3 w-28" />
          <div className="flex gap-2 pt-1">
            <Bone className="h-12 flex-1 rounded-md" />
            <Bone className="h-12 flex-1 rounded-md" />
            <Bone className="h-12 flex-1 rounded-md" />
          </div>
          <Bone className="h-9 w-32 rounded-md" />
        </div>
      ))}
    </div>
  );
}
