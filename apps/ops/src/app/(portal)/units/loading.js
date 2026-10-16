import { CardGridSkeleton, PageBarSkeleton } from "@/components/Skeleton";

// The buildings while they load: a grid of building cards.
export default function Loading() {
  return (
    <>
      <PageBarSkeleton />
      <div className="p-4 md:p-6">
        <CardGridSkeleton cards={6} />
      </div>
    </>
  );
}
