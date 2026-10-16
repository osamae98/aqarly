import { Bone, ScreenSkeleton } from "@/components/Skeleton";

// A request while it loads: its tags, title and unit, then the timeline.
export default function Loading() {
  return (
    <ScreenSkeleton>
      <div className="flex gap-2">
        <Bone className="h-5 w-24 rounded-pill" />
        <Bone className="h-5 w-16 rounded-pill" />
      </div>
      <Bone className="h-6 w-64 max-w-full" />
      <Bone className="h-3 w-40" />
      <div className="mt-2 flex flex-col gap-5 rounded-md border border-border bg-surface p-5">
        <Bone className="h-2.5 w-20" />
        {Array.from({ length: 4 }, (_, i) => (
          <div key={i} className="flex items-start gap-3.5">
            <Bone className="size-9 shrink-0 rounded-md" />
            <div className="flex flex-col gap-2 pt-1">
              <Bone className="h-3.5 w-28" />
              <Bone className="h-3 w-40" />
            </div>
          </div>
        ))}
      </div>
    </ScreenSkeleton>
  );
}
