import { Bone, RowSkeleton, ScreenSkeleton } from "@/components/Skeleton";

// Notifications while they load: a heading and a row per update.
export default function Loading() {
  return (
    <ScreenSkeleton>
      <Bone className="h-2.5 w-14" />
      <RowSkeleton />
      <RowSkeleton />
      <RowSkeleton />
      <RowSkeleton />
    </ScreenSkeleton>
  );
}
