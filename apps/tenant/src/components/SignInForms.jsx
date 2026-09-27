"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import Icon from "@aqarly/ui/Icon";
import Alert from "@aqarly/ui/Alert";
import Button from "@aqarly/ui/Button";
import Input from "@aqarly/ui/Input";
import Select from "@aqarly/ui/Select";
import {
  registerAction,
  resendCodeAction,
  sendCodeAction,
  verifyCodeAction,
} from "@/app/actions";
import Field from "@/components/Field";

// The sign-in screens' forms. Each posts to a server action and either moves
// on to where the action says, or shows the API's reason in an Alert.

function useSubmit(action, onOk) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState(null);

  function submit(formData) {
    startTransition(async () => {
      const result = await action(formData);
      if (result.ok) {
        setError(null);
        onOk(result);
      } else {
        setError(result.error);
      }
    });
  }

  return { submit, pending, error };
}

const inputClass =
  "rounded-md border-[1.5px] border-border bg-surface p-4 text-base text-ink transition-[border-color,box-shadow] placeholder:text-ink-muted focus:border-brand focus:shadow-focus focus:outline-none";

export function PhoneForm({ countries, defaultCountry }) {
  const router = useRouter();
  const { submit, pending, error } = useSubmit(sendCodeAction, () => router.push("/login/verify"));

  return (
    <form action={submit} className="w-full md:max-w-sm">
      {error && (
        <Alert tone="error" title="Couldn't send a code" className="mb-4">
          {error}
        </Alert>
      )}
      <Field
        label="Phone number"
        htmlFor="login-phone"
      >
        <div className="flex gap-2">
          <CountryPicker
            countries={countries}
            defaultCountry={defaultCountry}
            className="w-27 rounded-md border-[1.5px] border-border bg-surface p-4 text-base text-ink"
          />
          <input
            id="login-phone"
            name="phone"
            type="tel"
            autoComplete="tel-national"
            placeholder="50 123 4567"
            required
            className={`flex-1 ${inputClass}`}
          />
        </div>
      </Field>

      <Button type="submit" size="lg" fullWidth className="mt-6" disabled={pending}>
        {pending ? "Sending…" : "Send code"}
      </Button>
    </form>
  );
}

export function CodeForm() {
  const router = useRouter();
  const verify = useSubmit(verifyCodeAction, (result) => router.push(result.next));
  const resend = useSubmit(resendCodeAction, () => router.refresh());
  const error = verify.error ?? resend.error;

  return (
    <div className="w-full md:mx-auto md:max-w-sm">
      {error && (
        <Alert tone="error" title="Couldn't sign you in" className="mb-4">
          {error}
        </Alert>
      )}
      <form action={verify.submit}>
        <Field label="Enter code" htmlFor="otp">
          <input
            id="otp"
            name="code"
            type="text"
            inputMode="numeric"
            autoComplete="one-time-code"
            maxLength={6}
            placeholder="000000"
            required
            className={`text-center text-2xl tracking-[8px] ${inputClass}`}
          />
        </Field>

        <p className="my-4 text-center text-sm text-ink-muted">
          Didn&apos;t get a code?{" "}
          <button
            type="button"
            onClick={() => resend.submit(new FormData())}
            disabled={resend.pending}
            className="font-medium text-brand transition-colors hover:text-brand-hover disabled:opacity-50"
          >
            {resend.pending ? "Sending…" : "Resend"}
          </button>
        </p>

        <Button type="submit" size="lg" fullWidth disabled={verify.pending}>
          {verify.pending ? "Checking…" : "Verify"}
        </Button>
      </form>
    </div>
  );
}

// `buildings`: [{ id, name, units: [{ id, label }] }].
export function RegisterForm({ phone, buildings }) {
  const router = useRouter();
  const { submit, pending, error } = useSubmit(registerAction, (result) => router.push(result.next));
  const [buildingId, setBuildingId] = useState(null);
  const building = buildings.find((b) => b.id === buildingId);

  return (
    <form action={submit} className="flex flex-1 flex-col gap-6 md:mx-auto md:w-full md:max-w-lg">
      <p className="text-sm text-ink-soft">
        Just a few details to set up your account. Your building confirms you
        live there before you can see your home.
      </p>

      {error && (
        <Alert tone="error" title="Couldn't register you">
          {error}
        </Alert>
      )}

      <Input id="register-name" name="name" label="Full name" placeholder="e.g. Layla Al Habsi" required />

      <Field label="Phone number">
        <input
          aria-label="Phone number"
          value={phone}
          disabled
          className="rounded-md border-[1.5px] border-border bg-sunken p-4 text-base text-ink-soft"
        />
      </Field>

      <Field label="Building">
        <ul className="divide-y divide-border overflow-hidden rounded-md border border-border">
          {buildings.map((b) => (
            <li key={b.id}>
              <button
                type="button"
                aria-pressed={b.id === buildingId}
                onClick={() => setBuildingId(b.id)}
                className={[
                  "w-full p-4 text-left text-sm transition-colors",
                  b.id === buildingId ? "bg-brand-tint font-semibold text-brand" : "text-ink hover:bg-sunken",
                ].join(" ")}
              >
                {b.name}
              </button>
            </li>
          ))}
        </ul>
      </Field>

      {/* Remounted per building, so a unit picked in one building never
        * carries over to another. */}
      <Select
        key={buildingId ?? "none"}
        label="Unit number"
        name="unitId"
        placeholder={building ? "Choose your unit" : "Choose your building first"}
        disabled={!building}
        options={(building?.units ?? []).map((u) => ({ value: u.id, label: u.label }))}
      />

      <div className="mt-auto pt-2">
        <Button type="submit" size="lg" fullWidth disabled={pending || !building}>
          {pending ? "Sending…" : "Continue"}
        </Button>
      </div>
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
