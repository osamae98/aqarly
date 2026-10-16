import { PageBarSkeleton, TableSkeleton } from "@/components/Skeleton";

// The team while it loads: a row per person.
export default function Loading() {
  return (
    <>
      <PageBarSkeleton actions={2} />
      <div className="p-4 md:p-6">
        <TableSkeleton rows={5} columns={5} />
      </div>
    </>
  );
}
