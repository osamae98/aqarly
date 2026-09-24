import { redirect } from "next/navigation";
import { pendingSignIn } from "@aqarly/core/auth";
import { CodeForm } from "@/components/SignInForms";
import ScreenHeader from "@/components/ScreenHeader";

export const metadata = { title: "Enter code" };

export default async function VerifyCodePage() {
  const pending = await pendingSignIn();
  if (!pending) redirect("/login");

  return (
    <>
      <ScreenHeader backHref="/login" eyebrow="Sign in" title="Enter your code" />

      <main className="flex flex-1 flex-col gap-5 p-4 pb-10">
        <p className="text-sm text-ink-soft">
          Sent to <span className="font-semibold text-ink">{pending.phone}</span>.
        </p>

        {/* Codes aren't texted yet: the API hands the code back and it's
          * shown here, so the flow can be walked end to end. It goes once a
          * texting provider is wired in. */}
        {pending.shownCode && (
          <p className="rounded-md bg-brand-tint px-4 py-3 text-sm text-ink">
            Codes aren&apos;t texted yet. Yours is{" "}
            <span className="font-mono text-base font-bold tracking-[4px]">{pending.shownCode}</span>
          </p>
        )}

        <CodeForm />
      </main>
    </>
  );
}
