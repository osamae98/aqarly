import Button from "@aqarly/ui/Button";
import Input from "@aqarly/ui/Input";
import { getProperties } from "@aqarly/core/operations";
import Field from "@/components/Field";
import Screen from "@/components/Screen";
import { Search } from "@/components/icons";

export const metadata = { title: "Complete your profile" };

export default async function RegisterPage() {
  const properties = await getProperties();

  return (
    <Screen title="Complete your profile" backHref="/login/verify">
      <div className="flex flex-1 flex-col gap-6 md:mx-auto md:w-full md:max-w-lg">
        <p className="text-sm text-ink-soft">
          Just a few details to set up your account.
        </p>

        <Input id="register-name" label="Full name" placeholder="e.g. Layla Al Habsi" />

        <Field label="Phone number">
          <div className="flex gap-2">
            <input
              aria-label="Country code"
              defaultValue="+000"
              disabled
              className="w-27 rounded-md border-[1.5px] border-border bg-sunken p-4 text-base text-ink-soft"
            />
            <input
              aria-label="Phone number"
              defaultValue="000 0001"
              disabled
              className="flex-1 rounded-md border-[1.5px] border-border bg-sunken p-4 text-base text-ink-soft"
            />
          </div>
        </Field>

        <Field label="Building">
          <div className="relative">
            <input
              aria-label="Search buildings"
              placeholder="Search building..."
              className="w-full rounded-md border-[1.5px] border-border bg-surface p-4 pr-12 text-base text-ink transition-[border-color,box-shadow] placeholder:text-ink-muted focus:border-brand focus:shadow-focus focus:outline-none"
            />
            <Search
              size={16}
              className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-ink-muted"
            />
          </div>
          <ul className="mt-2 divide-y divide-border overflow-hidden rounded-md border border-border">
            {properties.map((property, index) => (
              <li
                key={property.id}
                className={[
                  "p-4 text-sm",
                  index === 0
                    ? "bg-brand-tint font-semibold text-brand"
                    : "text-ink",
                ].join(" ")}
              >
                {property.name}
              </li>
            ))}
          </ul>
        </Field>

        <Field label="Unit number">
          <div className="relative">
            <input
              aria-label="Search units"
              placeholder="Search unit..."
              className="w-full rounded-md border-[1.5px] border-border bg-surface p-4 pr-12 text-base text-ink transition-[border-color,box-shadow] placeholder:text-ink-muted focus:border-brand focus:shadow-focus focus:outline-none"
            />
            <Search
              size={16}
              className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-ink-muted"
            />
          </div>
        </Field>

        <div className="mt-auto pt-2">
          <Button href="/" size="lg" fullWidth>
            Continue
          </Button>
        </div>
      </div>
    </Screen>
  );
}
