import { Bone, ScreenHeaderSkeleton } from "@/components/Skeleton";

// A job while it loads: the header, its tags, what the tenant sent, the
// details, and the action buttons.
export default function Loading() {
  return (
    <>
      <ScreenHeaderSkeleton />
      <main className="flex flex-1 flex-col gap-5 p-4 pb-10">
        <div className="flex gap-2">
          <Bone className="h-6 w-36 rounded-pill" />
          <Bone className="h-6 w-20 rounded-pill" />
        </div>
        <div className="flex flex-col gap-2.5 rounded-lg border border-border bg-surface p-4">
          <Bone className="h-2.5 w-28" />
          <Bone className="h-3 w-full" />
          <Bone className="h-3 w-2/3" />
        </div>
        <div className="flex flex-col divide-y divide-border rounded-lg border border-border bg-surface px-4">
          {Array.from({ length: 3 }, (_, i) => (
            <div key={i} className="flex items-center gap-3 py-3.5">
              <Bone className="size-8 shrink-0 rounded-sm" />
              <div className="flex flex-col gap-2">
                <Bone className="h-2.5 w-16" />
                <Bone className="h-3.5 w-36" />
              </div>
            </div>
          ))}
        </div>
        <Bone className="h-13 w-full rounded-md" />
        <div className="flex gap-2.5">
          <Bone className="h-13 flex-1 rounded-md" />
          <Bone className="h-13 flex-1 rounded-md" />
        </div>
      </main>
    </>
  );
}
