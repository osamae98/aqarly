import { redirect } from "next/navigation";
import Button from "@aqarly/ui/Button";
import { getMe } from "@aqarly/core/auth";
import { signOutAction } from "@/app/actions";
import Screen from "@/components/Screen";

export const metadata = { title: "Waiting for your building" };
export const dynamic = "force-dynamic";

// A tenant who registered themselves waits here until their building (ops)
// confirms they live in the unit they picked, or declines it. Approval shows
// on the next load: nothing to sign in to again.
export default async function WaitingPage() {
  const me = await getMe();
  if (!me) redirect("/login");
  if (me.kind === "tenant") redirect("/");
  if (me.kind === "new" || !me.registration) redirect("/login/register");

  const { registration } = me;
  const where = `${registration.property.name}, unit ${registration.unit.label}`;
  const declined = registration.decision === "declined";

  return (
    <Screen title={declined ? "Couldn't confirm you" : "Almost there"} className="justify-center">
      <div className="flex flex-col gap-6 text-center md:mx-auto md:max-w-sm">
        {declined ? (
          <>
            <p className="text-base text-ink">
              Your building couldn&apos;t confirm that you live at{" "}
              <span className="font-semibold">{where}</span>.
            </p>
            <p className="text-sm text-ink-soft">
              Check the details with your building, then register again.
            </p>
            <Button href="/login/register" size="lg" fullWidth>
              Register again
            </Button>
          </>
        ) : (
          <>
            <p className="text-base text-ink">
              Thanks, {registration.name}. Your building is confirming that you
              live at <span className="font-semibold">{where}</span>.
            </p>
            <p className="text-sm text-ink-soft">
              Once they have, you&apos;ll see your home here. There&apos;s nothing
              else to do; check back later.
            </p>
          </>
        )}

        <form action={signOutAction}>
          <button
            type="submit"
            className="w-full rounded-pill py-4 text-base font-semibold text-danger transition-colors hover:bg-danger-tint"
          >
            Sign out
          </button>
        </form>
      </div>
    </Screen>
  );
}
