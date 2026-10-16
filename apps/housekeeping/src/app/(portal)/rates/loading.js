import { Bone, PageBarSkeleton, TableSkeleton } from "@/components/Skeleton";

// The rate card while it loads: the note above it, then a row per service.
export default function Loading() {
  return (
    <>
      <PageBarSkeleton actions={2} />
      <div className="flex flex-col gap-4 p-4 md:p-6">
        <Bone className="h-14 w-full rounded-md" />
        <TableSkeleton rows={4} columns={4} lead={false} />
      </div>
    </>
  );
}
