import { redirect } from "next/navigation";
import { getMe, getUnitChoices } from "@aqarly/core/auth";
import { getProperties } from "@aqarly/core/operations";
import Screen from "@/components/Screen";
import { RegisterForm } from "@/components/SignInForms";

export const metadata = { title: "Complete your profile" };
export const dynamic = "force-dynamic";

// For a proved phone with no account, or whose last registration was declined.
export default async function RegisterPage() {
  const me = await getMe();
  if (!me) redirect("/login");
  if (me.kind === "tenant") redirect("/");
  if (me.kind === "registration" && !me.registration?.decision) redirect("/login/waiting");

  const properties = await getProperties();
  const buildings = await Promise.all(
    properties.map(async (property) => ({
      id: property.id,
      name: property.name,
      units: await getUnitChoices(property.id),
    })),
  );

  return (
    <Screen title="Complete your profile" backHref="/login">
      <RegisterForm phone={me.phone} buildings={buildings} />
    </Screen>
  );
}
