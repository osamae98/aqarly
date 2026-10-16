import { Bone, PageBarSkeleton, TableSkeleton } from "@/components/Skeleton";

// The booking queue while it loads: search and "New booking", the filter
// chips row, then the table.
export default function Loading() {
  return (
    <>
      <PageBarSkeleton actions={2} />
      <div className="flex flex-col gap-4 p-4 md:p-6">
        <Bone className="h-12 w-full rounded-md" />
        <TableSkeleton rows={7} columns={6} />
      </div>
    </>
  );
}
