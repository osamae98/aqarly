// Shown at once while a screen's data is fetched. Usually a blink; after a
// quiet spell on a free host, the API can take a minute or two to wake, and
// this keeps the screen from sitting blank meanwhile.
export default function Loading() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-3 p-6 text-center">
      <span className="size-8 animate-spin rounded-pill border-[3px] border-border border-t-brand" aria-hidden />
      <p className="text-sm font-semibold text-ink">Loading…</p>
      <p className="max-w-xs text-xs text-ink-muted">
        If the portal hasn&apos;t been used for a while, this can take a minute.
      </p>
    </main>
  );
}
