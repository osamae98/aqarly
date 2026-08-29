import Button from "@aqarly/ui/Button";
import { site } from "@aqarly/core/site";
import Field from "@/components/Field";
import Logo from "@aqarly/ui/Logo";

export const metadata = { title: "Sign in" };

// Nothing here authenticates anyone: `getSignedInTenant()` is still a stub and
// there is no session. The screens exist so the flow the PRD describes —
// phone, one-time code, first-time profile — can be walked end to end.
export default function LoginPage() {
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

        <div className="w-full md:max-w-sm">
          <Field
            label="Phone number"
            htmlFor="login-phone"
            hint="The country code is a placeholder until the real dial codes are wired in"
          >
            <div className="flex gap-2">
              <input
                aria-label="Country code"
                defaultValue="+000"
                readOnly
                className="w-27 rounded-md border-[1.5px] border-border bg-surface p-4 text-base text-ink"
              />
              <input
                id="login-phone"
                type="tel"
                placeholder="000 0001"
                className="flex-1 rounded-md border-[1.5px] border-border bg-surface p-4 text-base text-ink transition-[border-color,box-shadow] placeholder:text-ink-muted focus:border-brand focus:shadow-focus focus:outline-none"
              />
            </div>
          </Field>

          <Button href="/login/verify" size="lg" fullWidth className="mt-6">
            Send code
          </Button>
        </div>
      </div>

      <p className="px-6 pb-6 text-center text-xs text-ink-muted">
        By signing in, you agree to our terms.
      </p>
    </div>
  );
}
