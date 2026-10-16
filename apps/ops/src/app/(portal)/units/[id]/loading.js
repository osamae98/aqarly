import { Bone, CardGridSkeleton, PageBarSkeleton } from "@/components/Skeleton";

// A unit (and its history) while it loads: the unit's open work as cards.
export default function Loading() {
  return (
    <>
      <PageBarSkeleton />
      <div className="flex flex-col gap-4 p-4 md:p-6">
        <Bone className="h-4 w-40" />
        <CardGridSkeleton cards={3} />
      </div>
    </>
  );
}
