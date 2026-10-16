import { Bone, RequestCardSkeleton, ScreenSkeleton } from "@/components/Skeleton";

// Home while it loads: the greeting, then request cards. The bottom bar
// stays, since it lives in the tabs layout.
export default function Loading() {
  return (
    <ScreenSkeleton>
      <Bone className="h-6 w-40" />
      <Bone className="mt-2 h-2.5 w-16" />
      <RequestCardSkeleton />
      <RequestCardSkeleton />
      <RequestCardSkeleton />
    </ScreenSkeleton>
  );
}
