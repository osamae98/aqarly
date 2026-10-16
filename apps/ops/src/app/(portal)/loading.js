import { Bone, PageBarSkeleton } from "@/components/Skeleton";

// Shown while a portal screen loads, inside the rail (which stays put). The
// screens with their own shape have their own loading.js next to them; this
// one is the reports page's: figures across the top, two panels under them.
export default function Loading() {
  return (
    <>
      <PageBarSkeleton actions={2} />
      <div className="flex flex-col gap-4 p-4 md:p-6">
        <div className="grid gap-3.5 sm:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }, (_, i) => (
            <div key={i} className="flex flex-col gap-3 rounded-md border border-border bg-surface p-4">
              <Bone className="h-2.5 w-24" />
              <Bone className="h-7 w-20" />
              <Bone className="h-2.5 w-32" />
            </div>
          ))}
        </div>
        <div className="grid gap-4 lg:grid-cols-2">
          {Array.from({ length: 2 }, (_, i) => (
            <div key={i} className="flex flex-col gap-3.5 rounded-md border border-border bg-surface p-4">
              <Bone className="h-4 w-40" />
              {Array.from({ length: 4 }, (_, row) => (
                <div key={row} className="flex items-center gap-3">
                  <Bone className="h-3 w-28" />
                  <Bone className="h-2.5 flex-1 rounded-pill" />
                  <Bone className="h-3 w-14" />
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
