import Link from "next/link";
import { redirect } from "next/navigation";
import { pendingSignIn } from "@aqarly/core/auth";
import Alert from "@aqarly/ui/Alert";
import { CodeForm } from "@/components/SignInForms";
import SignInCard from "../SignInCard";

export const metadata = { title: "Enter code" };

export default async function VerifyCodePage() {
  const pending = await pendingSignIn();
  if (!pending) redirect("/login");

  return (
    <SignInCard title="Enter your code">
      <p className="-mt-2 text-sm text-ink-soft">
        Sent to <span className="font-semibold text-ink">{pending.phone}</span>.{" "}
        <Link href="/login" className="font-semibold text-brand hover:text-brand-hover">
          Change
        </Link>
      </p>

      {/* Codes aren't texted yet: the API hands the code back and it's shown
        * here, so the flow can be walked end to end. It goes once a texting
        * provider is wired in. */}
      {pending.shownCode && (
        <Alert tone="info" title="Test code">
          Codes aren&apos;t texted yet. Yours is{" "}
          <span className="font-mono text-base font-semibold tracking-[4px]">{pending.shownCode}</span>
        </Alert>
      )}

      <CodeForm />
    </SignInCard>
  );
}
