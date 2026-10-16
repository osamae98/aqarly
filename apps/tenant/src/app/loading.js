import Spinner from "@/components/Spinner";

// Shown while a screen without its own placeholder loads (signing in,
// starting a request). The screens with a shape (home, history, profile,
// notifications, a request) have their own loading.js.
export default function Loading() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-3 p-6 text-center text-brand">
      <Spinner size={30} label="Loading" />
      <p className="text-sm font-semibold text-ink">Loading…</p>
    </main>
  );
}
