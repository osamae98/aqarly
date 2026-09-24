import { redirect } from "next/navigation";
import Logo from "@aqarly/ui/Logo";
import { getMe } from "@aqarly/core/auth";
import { site } from "@aqarly/core/site";
import { PhoneForm } from "@/components/SignInForms";

export const metadata = { title: "Sign in" };

// Phone number → one-time code (next screen) → first time only, a profile.
// Someone already signed in goes straight home.
export default async function LoginPage() {
  if ((await getMe())?.kind === "tenant") redirect("/");

  return (
    <div className="flex flex-1 flex-col">
      <div className="flex flex-1 flex-col items-center justify-center p-6">
        <Logo className="mb-2" />
        <h1 className="mb-2 text-center text-3xl font-semibold text-ink">
          {site.name}
        </h1>
        <p className="mb-8 text-center text-sm text-ink-soft">
          Your tenant services, in one place
        </p>

        <PhoneForm />
      </div>

      <p className="px-6 pb-6 text-center text-xs text-ink-muted">
        By signing in, you agree to our terms.
      </p>
    </div>
  );
}
