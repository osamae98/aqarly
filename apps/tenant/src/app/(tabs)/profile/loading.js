import { Bone, ScreenSkeleton } from "@/components/Skeleton";

// The profile while it loads: the avatar and name, then the detail cards.
export default function Loading() {
  return (
    <ScreenSkeleton>
      <div className="mb-4 flex flex-col items-center gap-3">
        <Bone className="size-18 rounded-pill" />
        <Bone className="h-5 w-40" />
        <Bone className="h-3 w-48" />
      </div>
      {Array.from({ length: 2 }, (_, card) => (
        <div key={card} className="flex flex-col gap-4 rounded-md border border-border bg-surface p-5">
          {Array.from({ length: 2 }, (_, row) => (
            <div key={row} className="flex items-center gap-3">
              <Bone className="size-5 rounded-sm" />
              <Bone className="h-3 w-20" />
              <Bone className="ms-auto h-3 w-32" />
            </div>
          ))}
        </div>
      ))}
    </ScreenSkeleton>
  );
}
