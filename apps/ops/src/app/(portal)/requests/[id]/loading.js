import { Bone } from "@/components/Skeleton";

// A request's page while it loads: the top bar, the title, the description,
// the facts strip and the activity timeline.
export default function Loading() {
  return (
    <>
      <div className="flex items-center gap-3 border-b border-border bg-surface px-4 py-3 md:px-6">
        <Bone className="h-3 w-48" />
        <Bone className="ms-auto h-9 w-28 rounded-md" />
      </div>
      <div className="flex flex-col gap-4 p-4 md:p-6">
        <Bone className="h-2.5 w-32" />
        <Bone className="h-7 w-80 max-w-full" />
        <div className="flex flex-col gap-2.5 rounded-md border border-border bg-surface p-4.5">
          <Bone className="h-3 w-full" />
          <Bone className="h-3 w-2/3" />
        </div>
        <div className="grid gap-px overflow-hidden rounded-md border border-border bg-border sm:grid-cols-4">
          {Array.from({ length: 4 }, (_, i) => (
            <div key={i} className="flex flex-col gap-2 bg-surface p-4">
              <Bone className="h-2.5 w-16" />
              <Bone className="h-3.5 w-28" />
              <Bone className="h-2.5 w-20" />
            </div>
          ))}
        </div>
        <Bone className="mt-2 h-2.5 w-20" />
        {Array.from({ length: 3 }, (_, i) => (
          <div key={i} className="flex items-start gap-3.5">
            <Bone className="size-8 shrink-0 rounded-pill" />
            <div className="flex flex-col gap-2 pt-1.5">
              <Bone className="h-3.5 w-44" />
              <Bone className="h-2.5 w-28" />
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
