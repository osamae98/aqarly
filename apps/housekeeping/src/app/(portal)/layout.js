import CompactNav from "@/components/CompactNav";
import PortalNav from "@/components/PortalNav";
import { getRequests, getSignedInAdmin } from "@aqarly/core/operations";

// The portal's shell, for everything but /login. Anyone who isn't signed in
// as a housekeeping admin is sent there first, before any data is asked for.
export default async function PortalLayout({ children }) {
  const admin = await getSignedInAdmin();

  // The rail carries a live count, so the shell reads it rather than the
  // pages passing it up.
  const open = await getRequests({ open: true, type: "housekeeping" });

  return (
    <div className="flex h-full overflow-hidden">
      <PortalNav className="hidden md:flex" openCount={open.length} admin={admin} />

      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <CompactNav openCount={open.length} />
        <main className="flex min-h-0 flex-1 flex-col overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
