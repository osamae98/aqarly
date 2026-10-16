import PageBar from "@/components/PageBar";
import RegistrationRows from "@/components/RegistrationRows";
import { getRegistrations } from "@aqarly/core/operations";
import EmptyState from "@/components/EmptyState";

export const metadata = {
  title: "Registrations",
};

// Tenants who signed up in the tenant portal. Until ops approves, they can
// sign in but see nothing of the unit; approving makes them its tenant.
export default async function RegistrationsPage() {
  const registrations = await getRegistrations();

  return (
    <>
      <PageBar
        title="Registrations"
        meta={
          registrations.length === 1
            ? "1 tenant waiting to be confirmed"
            : `${registrations.length} tenants waiting to be confirmed`
        }
      />

      <div className="min-h-0 flex-1 p-4 md:p-6">
        {registrations.length > 0 ? (
          <RegistrationRows registrations={registrations} />
        ) : (
          <EmptyState
            art="inbox"
            title="No one waiting"
            description="New tenant sign-ups show up here for you to confirm."
            className="rounded-md border border-border bg-surface px-6"
          />
        )}
      </div>
    </>
  );
}
