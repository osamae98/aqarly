import OpsMark from "@/components/OpsMark";

// The frame both sign-in screens sit in: the portal's mark and name over a
// card, centred on the page, with no rail (there's nothing to navigate to yet).
export default function SignInCard({ title, children }) {
  return (
    <main className="flex min-h-full items-center justify-center p-4">
      <div className="flex w-full max-w-sm flex-col gap-6">
        <div className="flex items-center gap-2.5">
          <OpsMark className="size-9" />
          <span className="text-[15px] font-semibold text-ink">Operations</span>
        </div>
        <div className="flex flex-col gap-5 rounded-lg border border-border bg-surface p-6 shadow-sm">
          <h1 className="text-[22px] leading-tight font-bold tracking-[-0.01em] text-ink">{title}</h1>
          {children}
        </div>
      </div>
    </main>
  );
}
