import PageBar from "@/components/PageBar";
import RegistrationRows from "@/components/RegistrationRows";
import { getRegistrations } from "@aqarly/core/operations";

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
          <div className="flex flex-col items-center gap-2 rounded-md border border-border bg-surface px-6 py-14 text-center">
            <h2 className="text-lg font-bold text-ink">No one waiting</h2>
            <p className="max-w-sm text-sm text-ink-soft">
              When a tenant registers in the tenant portal, they appear here for
              you to confirm they live where they say.
            </p>
          </div>
        )}
      </div>
    </>
  );
}
