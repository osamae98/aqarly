import { Bone, ScreenHeaderSkeleton } from "@/components/Skeleton";

// Finishing a job while it loads: the header, the photo slots, the note
// box and the button.
export default function Loading() {
  return (
    <>
      <ScreenHeaderSkeleton />
      <main className="flex flex-1 flex-col gap-5 p-4 pb-10">
        <Bone className="h-2.5 w-16" />
        <div className="flex gap-2.5">
          <Bone className="size-24 rounded-lg" />
          <Bone className="size-24 rounded-lg" />
          <Bone className="size-24 rounded-lg" />
        </div>
        <Bone className="h-2.5 w-28" />
        <Bone className="h-24 w-full rounded-md" />
        <Bone className="h-14 w-full rounded-md" />
      </main>
    </>
  );
}
