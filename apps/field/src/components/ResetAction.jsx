// The field app's jobs now live in aqarly-api's database, not in this
// process, so resetting this app's in-memory store would change nothing on
// screen. The way back to a known state is the API's seed script. There is no
// reset endpoint: an unauthenticated "wipe everything" route has no place in
// an API that will be deployed. Kept on screen, disabled, so the control says
// why rather than pretending.
export default function ResetAction() {
  return (
    <div className="flex flex-col items-center gap-1 self-center text-center">
      <button
        type="button"
        disabled
        className="text-xs font-medium text-ink-muted underline underline-offset-4 disabled:opacity-50"
      >
        Reset demo data
      </button>
      <p className="text-xs text-ink-muted">
        Jobs now live in the API. Reset them with{" "}
        <code>uv run python scripts/seed.py</code> in aqarly-api.
      </p>
    </div>
  );
}
