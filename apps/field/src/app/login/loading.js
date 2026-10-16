import Spinner from "@/components/Spinner";

// Signing in has nothing worth sketching: just the spinner, so the
// worklist's placeholder (app/loading.js) never shows here.
export default function Loading() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-3 p-6 text-center text-brand">
      <Spinner size={30} label="Loading" />
      <p className="text-sm font-semibold text-ink">Loading…</p>
    </main>
  );
}
