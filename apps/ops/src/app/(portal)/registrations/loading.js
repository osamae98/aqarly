import { Bone, PageBarSkeleton } from "@/components/Skeleton";

// Registrations while they load: a card per tenant waiting, with their
// details on the left and Approve / Decline on the right.
export default function Loading() {
  return (
    <>
      <PageBarSkeleton actions={0} />
      <div className="flex flex-col gap-3 p-4 md:p-6">
        {Array.from({ length: 3 }, (_, i) => (
          <div key={i} className="flex flex-wrap items-start gap-4 rounded-md border border-border bg-surface p-4">
            <Bone className="size-9 shrink-0 rounded-pill" />
            <div className="flex flex-1 flex-col gap-2">
              <Bone className="h-3.5 w-40" />
              <Bone className="h-3 w-28" />
              <Bone className="h-3 w-48" />
            </div>
            <Bone className="h-9 w-20 rounded-md" />
            <Bone className="h-9 w-24 rounded-md" />
          </div>
        ))}
      </div>
    </>
  );
}
