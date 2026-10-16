import { Bone, RowSkeleton, ScreenSkeleton } from "@/components/Skeleton";

// History while it loads: a month heading and its finished requests.
export default function Loading() {
  return (
    <ScreenSkeleton>
      <Bone className="h-6 w-full rounded-pill" />
      <Bone className="mt-2 h-2.5 w-24" />
      <RowSkeleton />
      <RowSkeleton />
      <RowSkeleton />
    </ScreenSkeleton>
  );
}
