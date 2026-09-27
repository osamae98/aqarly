"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import Icon from "@aqarly/ui/Icon";
import Alert from "@aqarly/ui/Alert";
import Button from "@aqarly/ui/Button";
import { resendCodeAction, sendCodeAction, verifyCodeAction } from "@/app/actions";
import { Label, useFormAction } from "@/components/Field";

// The two sign-in screens' forms. Each posts to a server action and either
// moves on or shows the API's reason as it is ("This number isn't an admin
// of this portal.").

const input =
  "h-11 rounded-md border-[1.5px] border-border bg-surface px-3.5 text-[15px] text-ink transition-[border-color,box-shadow] placeholder:text-ink-muted focus:border-brand focus:shadow-focus focus:outline-none";

export function PhoneForm({ countries, defaultCountry }) {
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
          <CountryPicker
            countries={countries}
            defaultCountry={defaultCountry}
            className="h-11 w-22 rounded-md border-[1.5px] border-border bg-surface px-2.5 text-[15px] text-ink"
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
