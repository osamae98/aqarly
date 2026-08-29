import PageBar from "@/components/PageBar";
import UnitRows from "@/components/UnitRows";
import Tabs from "@aqarly/ui/Tabs";
import { getPropertyRollups, getUnits } from "@aqarly/core/operations";

export const metadata = {
  title: "Units",
};

export default async function UnitsPage({ searchParams }) {
  const params = await searchParams;

  const [units, properties] = await Promise.all([
    getUnits({ propertyId: params.propertyId }),
    getPropertyRollups(),
  ]);

  const scope = properties.find((p) => p.id === params.propertyId);
  const withWork = units.filter((unit) => unit.openCount > 0).length;

  return (
    <>
      <PageBar
        title={scope ? scope.name : "Units"}
        meta={`${units.length} ${units.length === 1 ? "unit" : "units"} · ${withWork} with open work`}
      />

      {/* Building scope is URL state, so the tabs are links. */}
      <div className="border-b border-border bg-surface px-4 md:px-6">
        <Tabs
          value={params.propertyId ?? "all"}
          tabs={[
            { value: "all", label: "All buildings", href: "/units" },
            ...properties.map((property) => ({
              value: property.id,
              label: property.name,
              count: property.units,
              href: `/units?propertyId=${property.id}`,
            })),
          ]}
        />
      </div>

      <div className="min-h-0 flex-1 overflow-x-auto p-4 md:p-6">
        <UnitRows units={units} />
      </div>
    </>
  );
}
