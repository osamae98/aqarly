import CompactNav from "@/components/CompactNav";
import OpsNav from "@/components/OpsNav";
import { getRegistrations, getRequests, getSignedInAdmin } from "@aqarly/core/operations";

// The portal's shell, for everything but /login. Anyone who isn't signed in
// as an ops admin is sent there first, before any data is asked for.
export default async function PortalLayout({ children }) {
  const admin = await getSignedInAdmin();

  // The rail carries live counts, so the shell reads them rather than the
  // pages passing them up.
  const [open, registrations] = await Promise.all([
    getRequests({ open: true, type: "maintenance" }),
    getRegistrations(),
  ]);

  return (
    <div className="flex h-full overflow-hidden">
      <OpsNav
        className="hidden md:flex"
        openCount={open.length}
        registrationCount={registrations.length}
        admin={admin}
      />

      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <CompactNav openCount={open.length} registrationCount={registrations.length} />
        <main className="flex min-h-0 flex-1 flex-col overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
