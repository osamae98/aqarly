import { redirect } from "next/navigation";
import { getMe } from "@aqarly/core/auth";
import { countryOptions, defaultCountry } from "@aqarly/core/phone";
import { PhoneForm } from "@/components/SignInForms";
import SignInCard from "./SignInCard";

export const metadata = { title: "Sign in" };

// Phone number → one-time code (next screen) → the portal. No registering:
// admins are added in the API, and only their numbers get in. Someone
// already signed in goes straight to work.
export default async function LoginPage() {
  if ((await getMe())?.kind === "admin") redirect("/requests");

  return (
    <SignInCard title="Sign in">
      <p className="-mt-2 text-sm text-ink-soft">Housekeeping bookings across the portfolio. We&apos;ll send a code to your phone.</p>
      <PhoneForm countries={countryOptions()} defaultCountry={defaultCountry} />
    </SignInCard>
  );
}
