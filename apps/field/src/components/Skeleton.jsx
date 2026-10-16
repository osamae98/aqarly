// Placeholders shown while a screen loads (the `loading.js` files under
// app/), drawn in the shape of what's coming so nothing jumps when it
// arrives. A soft light sweeps across them (`.skeleton` in globals.css);
// people who turn motion off see them still.

// One gray block. Size it with classes: `<Bone className="h-3 w-40" />`.
export function Bone({ className = "" }) {
  return <span aria-hidden className={`skeleton block rounded-sm ${className}`} />;
}

// A job in the queue: its tile, title and where, like `JobRow`.
export function JobRowSkeleton() {
  return (
    <div className="flex items-center gap-3 rounded-lg bg-surface px-3.5 py-3 shadow-sm">
      <Bone className="size-10 shrink-0 rounded-sm" />
      <div className="flex flex-1 flex-col gap-2">
        <Bone className="h-3.5 w-44" />
        <Bone className="h-3 w-28" />
      </div>
    </div>
  );
}

// The bar every screen below the worklist opens with: back, the job's
// reference, the screen's title.
export function ScreenHeaderSkeleton() {
  return (
    <div className="flex items-start gap-3 border-b border-border bg-surface px-4 py-3.5">
      <Bone className="size-9 shrink-0 rounded-pill" />
      <div className="flex flex-1 flex-col gap-2 py-0.5">
        <Bone className="h-2.5 w-20" />
        <Bone className="h-4 w-52" />
      </div>
    </div>
  );
}
