import AddStaffAction from "@/components/AddStaffAction";
import InviteAction from "@/components/InviteAction";
import PageBar from "@/components/PageBar";
import StaffRows from "@/components/StaffRows";
import { getStaffRoster, staffCapacity } from "@aqarly/core/operations";

export const metadata = {
  title: "Field staff",
};

export default async function StaffPage() {
  const staff = await getStaffRoster();

  const totalLoad = staff.reduce((sum, member) => sum + member.load, 0);

  return (
    <>
      <PageBar
        title="Field staff"
        meta={`${staff.length} technicians · ${totalLoad} of ${
          staff.length * staffCapacity
        } slots in use`}
      >
        {/* Ops PRD §9: this roster is a Phase 1 stand-in, not the record. */}
        <span className="rounded-pill bg-info-tint px-3.5 py-1.5 text-[12.5px] font-semibold text-info-ink">
          Names, contracts and pay live in the HRMS
        </span>
        <AddStaffAction />
        <InviteAction />
      </PageBar>

      <div className="min-h-0 flex-1 overflow-x-auto p-4 md:p-6">
        <StaffRows staff={staff} />
        <p className="border-t border-border pt-3.5 text-[13px] text-ink-muted">
          Name and trade are ops-owned and editable here. Buildings and load
          are derived from who requests were assigned to; everything else
          comes from the HRMS once Phase 3 lands.
        </p>
      </div>
    </>
  );
}
