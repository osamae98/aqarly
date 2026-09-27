"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import Icon from "@aqarly/ui/Icon";
import { resendCodeAction, sendCodeAction, verifyCodeAction } from "@/app/actions";
import { FormNote, Label, useFormAction } from "./Field";

// The two sign-in screens' forms, in the field app's own controls: one thumb,
// 48px targets, the API's reason shown as it is when it refuses.

const input =
  "h-13 rounded-md border-[1.5px] border-border bg-surface px-4 text-base text-ink transition-[border-color,box-shadow] placeholder:text-ink-muted focus:border-brand focus:shadow-focus focus:outline-none";

const primary =
  "flex h-13 w-full items-center justify-center rounded-pill bg-brand px-5 text-base font-semibold text-ink-inverse transition-colors active:bg-brand-active disabled:opacity-50";

export function PhoneForm({ countries, defaultCountry }) {
  const router = useRouter();
  const send = useFormAction(sendCodeAction, { onSuccess: () => router.push("/login/verify") });

  return (
    <form action={send.submit} className="flex flex-col gap-4">
      <FormNote state={send.result} />
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="login-phone">Your work mobile</Label>
        <div className="flex gap-2">
          <CountryPicker
            countries={countries}
            defaultCountry={defaultCountry}
            className="h-13 w-24 rounded-md border-[1.5px] border-border bg-surface px-3 text-base text-ink"
          />
          <input
            id="login-phone"
            name="phone"
            type="tel"
            autoComplete="tel-national"
            placeholder="50 123 4567"
            required
            className={`min-w-0 flex-1 ${input}`}
          />
        </div>
        <p className="text-xs text-ink-muted">
          The number the office has for you.
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

// The country picker: a native select laid invisibly over a box showing the
// chosen code, so the phone's own list opens on tap while the field stays as
// narrow as "+966". `countries` comes from the page (@aqarly/core/phone).
function CountryPicker({ countries, defaultCountry, className }) {
  const [country, setCountry] = useState(defaultCountry);
  const code = countries.find((option) => option.value === country)?.code;

  return (
    <label className={`relative flex shrink-0 cursor-pointer items-center justify-center gap-1 focus-within:border-brand focus-within:shadow-focus ${className}`}>
      <span aria-hidden>+{code}</span>
      <Icon name="chevron-down" size={14} className="text-ink-muted" />
      <select
        aria-label="Country"
        name="country"
        value={country}
        onChange={(event) => setCountry(event.target.value)}
        className="absolute inset-0 cursor-pointer opacity-0"
      >
        {countries.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}
