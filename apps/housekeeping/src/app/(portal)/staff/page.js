import AddStaffAction from "@/components/AddStaffAction";
import InviteAction from "@/components/InviteAction";
import PageBar from "@/components/PageBar";
import StaffRows from "@/components/StaffRows";
import { getStaffRoster, staffCapacity } from "@aqarly/core/operations";

export const metadata = {
  title: "Housekeeping staff",
};

export default async function StaffPage() {
  const staff = await getStaffRoster({ type: "housekeeping" });

  const totalLoad = staff.reduce((sum, member) => sum + member.load, 0);

  return (
    <>
      <PageBar
        title="Housekeeping staff"
        meta={`${staff.length} ${staff.length === 1 ? "housekeeper" : "housekeepers"}, ${totalLoad} of ${
          staff.length * staffCapacity
        } slots in use`}
      >
        <AddStaffAction />
        <InviteAction />
      </PageBar>

      <div className="min-h-0 flex-1 overflow-x-auto p-4 md:p-6">
        <StaffRows staff={staff} />
      </div>
    </>
  );
}
