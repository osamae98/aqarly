"use client";

import { useRouter } from "next/navigation";
import { resendCodeAction, sendCodeAction, verifyCodeAction } from "@/app/actions";
import { FormNote, Label, useFormAction } from "./Field";

// The two sign-in screens' forms, in the field app's own controls: one thumb,
// 48px targets, the API's reason shown as it is when it refuses.

const input =
  "h-13 rounded-md border-[1.5px] border-border bg-surface px-4 text-base text-ink transition-[border-color,box-shadow] placeholder:text-ink-muted focus:border-brand focus:shadow-focus focus:outline-none";

const primary =
  "flex h-13 w-full items-center justify-center rounded-pill bg-brand px-5 text-base font-semibold text-ink-inverse transition-colors active:bg-brand-active disabled:opacity-50";

export function PhoneForm() {
  const router = useRouter();
  const send = useFormAction(sendCodeAction, { onSuccess: () => router.push("/login/verify") });

  return (
    <form action={send.submit} className="flex flex-col gap-4">
      <FormNote state={send.result} />
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="login-phone">Your work mobile</Label>
        <div className="flex gap-2">
          <input
            aria-label="Country code"
            name="countryCode"
            defaultValue="+000"
            readOnly
            className="h-13 w-24 rounded-md border-[1.5px] border-border bg-sunken px-4 text-base text-ink-soft"
          />
          <input
            id="login-phone"
            name="phone"
            type="tel"
            autoComplete="tel-national"
            placeholder="000 0101"
            required
            className={`min-w-0 flex-1 ${input}`}
          />
        </div>
        <p className="text-xs text-ink-muted">
          The number the office has for you. The country code is a placeholder until real dial codes are wired in.
        </p>
      </div>
      <button type="submit" disabled={send.pending} className={primary}>
        {send.pending ? "Sending…" : "Send code"}
      </button>
    </form>
  );
}

export function CodeForm() {
  const router = useRouter();
  const verify = useFormAction(verifyCodeAction, { onSuccess: () => router.replace("/") });
  const resend = useFormAction(resendCodeAction, { onSuccess: () => router.refresh() });
  const failed = verify.result?.error ? verify.result : resend.result;

  return (
    <form action={verify.submit} className="flex flex-col gap-4">
      <FormNote state={failed} />
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
          className={`text-center text-2xl tracking-[8px] ${input}`}
        />
      </div>
      <button type="submit" disabled={verify.pending} className={primary}>
        {verify.pending ? "Checking…" : "Sign in"}
      </button>
      <button
        type="button"
        onClick={() => resend.submit(new FormData())}
        disabled={resend.pending}
        className="flex h-12 items-center justify-center text-sm font-semibold text-brand disabled:opacity-50"
      >
        {resend.pending ? "Sending…" : "Send a new code"}
      </button>
    </form>
  );
}
