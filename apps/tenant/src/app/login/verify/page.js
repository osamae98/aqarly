import Link from "next/link";
import Button from "@aqarly/ui/Button";
import Field from "@/components/Field";
import Screen from "@/components/Screen";

export const metadata = { title: "Verify code" };

export default function VerifyCodePage() {
  return (
    <Screen title="Verify code" backHref="/login" className="justify-center">
      <div className="w-full md:mx-auto md:max-w-sm">
        <Field label="Enter code" htmlFor="otp">
          <input
            id="otp"
            type="text"
            inputMode="numeric"
            maxLength={6}
            placeholder="000000"
            className="rounded-md border-[1.5px] border-border bg-surface p-4 text-center text-2xl tracking-[8px] text-ink transition-[border-color,box-shadow] placeholder:text-ink-muted focus:border-brand focus:shadow-focus focus:outline-none"
          />
        </Field>
        <p className="mt-2 text-xs text-ink-muted">
          A code would be sent to the number you entered — no code is sent
          today, since nothing is wired to a provider.
        </p>

        <p className="my-4 text-center text-sm text-ink-muted">
          Didn&apos;t get a code?{" "}
          <span className="font-medium text-brand">Resend</span>
        </p>

        <Button href="/" size="lg" fullWidth>
          Verify
        </Button>

        <p className="mt-4 text-center text-sm text-ink-muted">
          First time here?{" "}
          <Link
            href="/login/register"
            className="font-medium text-brand transition-colors hover:text-brand-hover"
          >
            Complete your profile
          </Link>
        </p>
      </div>
    </Screen>
  );
}
