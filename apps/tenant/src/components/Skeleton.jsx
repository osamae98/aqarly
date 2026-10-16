// Placeholders shown while a screen loads (the `loading.js` files under
// app/), drawn in the shape of what's coming so nothing jumps when it
// arrives. A soft light sweeps across them (`.skeleton` in globals.css);
// people who turn motion off see them still.

// One gray block. Size it with classes: `<Bone className="h-3 w-40" />`.
export function Bone({ className = "" }) {
  return <span aria-hidden className={`skeleton block rounded-sm ${className}`} />;
}

// The header bar every screen opens with, then the screen's body.
export function ScreenSkeleton({ children }) {
  return (
    <>
      <div className="flex items-center gap-4 border-b border-border bg-surface px-4 py-4">
        <Bone className="h-4 w-36" />
        <Bone className="ms-auto size-6 rounded-pill" />
      </div>
      <main className="flex flex-1 flex-col gap-4 p-6">{children}</main>
    </>
  );
}

// A request card: its type tag, title, where, and its stage.
export function RequestCardSkeleton() {
  return (
    <div className="flex flex-col gap-3 rounded-md border border-border bg-surface p-5">
      <Bone className="h-5 w-24 rounded-pill" />
      <Bone className="h-4 w-56 max-w-full" />
      <Bone className="h-3 w-40" />
      <div className="flex items-center justify-between pt-1">
        <Bone className="h-3 w-28" />
        <Bone className="h-5 w-20 rounded-pill" />
      </div>
    </div>
  );
}

// A list row: an icon, two lines of text.
export function RowSkeleton() {
  return (
    <div className="flex items-start gap-3 rounded-md border border-border bg-surface p-4">
      <Bone className="size-9 shrink-0 rounded-pill" />
      <div className="flex flex-1 flex-col gap-2 pt-0.5">
        <Bone className="h-3.5 w-48 max-w-full" />
        <Bone className="h-3 w-32" />
      </div>
    </div>
  );
}
