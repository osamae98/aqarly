import { categoryLabels, maintenanceCategories } from "@aqarly/core/operations";
import MaintenanceRequestForm from "@/components/MaintenanceRequestForm";
import Screen from "@/components/Screen";

export const metadata = { title: "Maintenance" };

const categoryOptions = maintenanceCategories.map((category) => ({
  value: category,
  label: categoryLabels[category],
}));

export default function MaintenanceRequestPage() {
  return (
    <Screen title="Maintenance" backHref="/requests/new">
      <MaintenanceRequestForm categoryOptions={categoryOptions} />
    </Screen>
  );
}
