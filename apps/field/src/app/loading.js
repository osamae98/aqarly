import { Bone, JobRowSkeleton } from "@/components/Skeleton";

// The worklist while it loads: the header, the three count tiles, the job
// to do next, and the queue behind it. Job screens have their own.
export default function Loading() {
  return (
    <main className="flex flex-1 flex-col gap-5 p-4 pb-10">
      <div className="flex items-center gap-3 pt-2">
        <Bone className="size-8.5 rounded-md" />
        <div className="flex flex-col gap-2">
          <Bone className="h-2.5 w-36" />
          <Bone className="h-6 w-32" />
        </div>
      </div>
      <div className="flex gap-2.5">
        <Bone className="h-16 flex-1 rounded-lg" />
        <Bone className="h-16 flex-1 rounded-lg" />
        <Bone className="h-16 flex-1 rounded-lg" />
      </div>
      <div className="flex flex-col gap-4 rounded-lg border border-border bg-surface p-5">
        <Bone className="h-5 w-28 rounded-pill" />
        <Bone className="h-6 w-56" />
        <Bone className="h-3 w-40" />
        <Bone className="h-13 w-full rounded-md" />
      </div>
      <Bone className="h-2.5 w-12" />
      <JobRowSkeleton />
      <JobRowSkeleton />
    </main>
  );
}
