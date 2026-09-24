import { redirect } from "next/navigation";
import Alert from "@aqarly/ui/Alert";
import { pendingSignIn } from "@aqarly/core/auth";
import Screen from "@/components/Screen";
import { CodeForm } from "@/components/SignInForms";

export const metadata = { title: "Verify code" };
export const dynamic = "force-dynamic";

export default async function VerifyCodePage() {
  const pending = await pendingSignIn();
  if (!pending) redirect("/login");

  return (
    <Screen title="Verify code" backHref="/login" className="justify-center">
      <div className="w-full md:mx-auto md:max-w-sm">
        <p className="mb-6 text-sm text-ink-soft">
          Enter the 6-digit code for <span className="font-semibold text-ink">{pending.phone}</span>.
        </p>

        {/* Codes aren't texted yet: the API hands the code back and it's shown
          * here, so the flow can be walked end to end. It goes once a texting
          * provider is wired in. */}
        {pending.shownCode && (
          <Alert tone="info" title="Test code" className="mb-6">
            Codes aren&apos;t texted yet. Yours is{" "}
            <span className="font-mono text-base font-semibold tracking-[4px]">{pending.shownCode}</span>
          </Alert>
        )}
      </div>
      <CodeForm />
    </Screen>
  );
}
