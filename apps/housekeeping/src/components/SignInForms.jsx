"use client";

import { useRouter } from "next/navigation";
import Alert from "@aqarly/ui/Alert";
import Button from "@aqarly/ui/Button";
import { resendCodeAction, sendCodeAction, verifyCodeAction } from "@/app/actions";
import { Label, useFormAction } from "@/components/Field";

// The two sign-in screens' forms. Each posts to a server action and either
// moves on or shows the API's reason as it is ("This number isn't an admin
// of this portal.").

const input =
  "h-11 rounded-md border-[1.5px] border-border bg-surface px-3.5 text-[15px] text-ink transition-[border-color,box-shadow] placeholder:text-ink-muted focus:border-brand focus:shadow-focus focus:outline-none";

export function PhoneForm({ placeholder }) {
  const router = useRouter();
  const send = useFormAction(sendCodeAction, { onSuccess: () => router.push("/login/verify") });

  return (
    <form action={send.submit} className="flex flex-col gap-4">
      {send.result?.error && (
        <Alert tone="error" title="Couldn't send a code">
          {send.result.error}
        </Alert>
      )}
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="login-phone">Mobile number</Label>
        <div className="flex gap-2">
          <input
            aria-label="Country code"
            name="countryCode"
            defaultValue="+000"
            readOnly
            className="h-11 w-20 rounded-md border-[1.5px] border-border bg-sunken px-3.5 text-[15px] text-ink-soft"
          />
          <input
            id="login-phone"
            name="phone"
            type="tel"
            autoComplete="tel-national"
            placeholder={placeholder}
            required
            className={`min-w-0 flex-1 ${input}`}
          />
        </div>
        <p className="text-xs text-ink-muted">
          The country code is a placeholder until real dial codes are wired in.
        </p>
      </div>
      <Button type="submit" size="lg" fullWidth disabled={send.pending}>
        {send.pending ? "Sending…" : "Send code"}
      </Button>
    </form>
  );
}

export function CodeForm() {
  const router = useRouter();
  const verify = useFormAction(verifyCodeAction, { onSuccess: () => router.replace("/requests") });
  const resend = useFormAction(resendCodeAction, { onSuccess: () => router.refresh() });
  const error = verify.result?.error ?? resend.result?.error;

  return (
    <form action={verify.submit} className="flex flex-col gap-4">
      {error && (
        <Alert tone="error" title="Couldn't sign you in">
          {error}
        </Alert>
      )}
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="otp">6-digit code</Label>
        <input
          id="otp"
          name="code"
          type="text"
          inputMode="numeric"
          autoComplete="one-time-code"
          maxLength={6}
          placeholder="000000"
          required
          className={`text-center text-xl tracking-[8px] ${input}`}
        />
      </div>
      <Button type="submit" size="lg" fullWidth disabled={verify.pending}>
        {verify.pending ? "Checking…" : "Sign in"}
      </Button>
      <button
        type="button"
        onClick={() => resend.submit(new FormData())}
        disabled={resend.pending}
        className="cursor-pointer text-sm font-semibold text-brand transition-colors hover:text-brand-hover disabled:opacity-50"
      >
        {resend.pending ? "Sending…" : "Send a new code"}
      </button>
    </form>
  );
}
