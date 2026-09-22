"use client";

import { useRouter } from "next/navigation";
import { completeJobAction } from "@/app/actions";
import { FormNote, PhotoField, Textarea, useFormAction } from "./Field";

// Closing a job. The charge is stated above this form, not collected by it —
// nothing here sets what the tenant pays, which is why the button can name
// the figure with a straight face.
export default function FinishForm({ job, submitLabel, required, max }) {
  const router = useRouter();

  // Back to the worklist, which is where the next job now leads. Pushed from
  // the submit rather than an effect, so it happens once.
  const finish = useFormAction(completeJobAction, {
    onSuccess: () => router.push("/"),
  });

  return (
    <form action={finish.submit} className="flex flex-col gap-5">
      <input type="hidden" name="id" value={job.id} />

      <PhotoField name="photos" required={required} max={max} />

      <Textarea
        label="Note for the office"
        name="notes"
        placeholder="What you found, what you did, anything that needs following up."
        hint="Optional. The tenant sees this on the request once it is closed."
      />

      <FormNote state={finish.result} />

      <button
        type="submit"
        disabled={finish.pending}
        className="flex h-14 items-center justify-center rounded-pill bg-brand px-5 text-base font-bold text-ink-inverse transition-colors active:bg-brand-active disabled:opacity-50"
      >
        {finish.pending ? "Marking done…" : submitLabel}
      </button>
    </form>
  );
}
