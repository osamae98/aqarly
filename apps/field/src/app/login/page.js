import { redirect } from "next/navigation";
import Logo from "@aqarly/ui/Logo";
import { getMe } from "@aqarly/core/auth";
import { countryOptions, defaultCountry } from "@aqarly/core/phone";
import { PhoneForm } from "@/components/SignInForms";

export const metadata = { title: "Sign in" };

// Phone number → one-time code (next screen) → the worklist. There is no
// registering here: the office adds technicians to the roster, and only a
// number on it gets in. Someone already signed in goes straight to work.
export default async function LoginPage() {
  if ((await getMe())?.kind === "staff") redirect("/");

  return (
    <main className="flex flex-1 flex-col justify-center gap-8 p-4 pb-10">
      <header className="flex flex-col gap-3">
        <Logo size={40} />
        <h1 className="text-[26px] leading-tight font-bold tracking-[-0.02em] text-ink">
          Sign in to your work
        </h1>
        <p className="text-sm text-ink-soft">We&apos;ll send a code to your phone.</p>
      </header>

      <PhoneForm countries={countryOptions()} defaultCountry={defaultCountry} />
    </main>
  );
}
