import PageBar from "@/components/PageBar";
import UnitRows from "@/components/UnitRows";
import { getPropertyRollups, getUnits } from "@aqarly/core/operations";

export const metadata = {
  title: "Buildings",
};

export default async function UnitsPage({ searchParams }) {
  const params = await searchParams;

  const [units, properties] = await Promise.all([
    getUnits({ propertyId: params.propertyId }),
    getPropertyRollups(),
  ]);

  const scope = properties.find((p) => p.id === params.propertyId);
  const withWork = units.filter((unit) => unit.openCount > 0).length;

  // Building scope lives in the column header, the way the queue's filters
  // do, so the screen has one filtering idiom rather than two.
  const buildings = [
    { value: null, label: "All buildings", count: units.length },
    ...properties.map((property) => ({
      value: property.id,
      label: property.name,
      count: property.units,
    })),
  ];

  return (
    <>
      <PageBar
        title={scope ? scope.name : "Buildings"}
        meta={
          scope
            ? `${units.length} ${units.length === 1 ? "unit" : "units"} · ${withWork} with open work`
            : `${properties.length} buildings · ${units.length} units · ${withWork} with open work`
        }
      />

      <div className="min-h-0 flex-1 overflow-x-auto p-4 md:p-6">
        <UnitRows units={units} buildings={buildings} searchParams={params} />
      </div>
    </>
  );
}
