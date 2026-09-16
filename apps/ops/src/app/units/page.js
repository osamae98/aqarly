import Link from "next/link";
import BuildingCard from "@/components/BuildingCard";
import Icon from "@aqarly/ui/Icon";
import PageBar from "@/components/PageBar";
import UnitCard from "@/components/UnitCard";
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

  if (!scope) {
    // Portfolio view: one card per building, alphabetical so a building is
    // found by name rather than by where its spend happens to rank.
    const buildings = [...properties]
      .sort((a, b) => a.name.localeCompare(b.name))
      .filter((building) => {
        const needle = params.q?.trim().toLowerCase();
        if (!needle) return true;
        return (
          building.name.toLowerCase().includes(needle) ||
          building.address.toLowerCase().includes(needle)
        );
      });

    return (
      <>
        <PageBar
          title="Buildings"
          meta={`${properties.length} buildings · ${units.length} units · ${withWork} with open work`}
        >
          {/* Submitting is what applies the search, so the bar says so
           * rather than leaving Enter as the only way in. */}
          <form
            action="/units"
            className="flex h-10 items-center gap-1.5 rounded-pill border border-border bg-page ps-4 pe-1 transition-[border-color,box-shadow] focus-within:border-brand focus-within:shadow-focus"
          >
            <input
              type="search"
              name="q"
              defaultValue={params.q ?? ""}
              placeholder="Search buildings, area…"
              aria-label="Search buildings"
              className="w-full min-w-0 bg-transparent text-[13.5px] text-ink placeholder:text-ink-muted focus:outline-none sm:w-52"
            />
            <button
              type="submit"
              aria-label="Search"
              className="flex size-8 shrink-0 cursor-pointer items-center justify-center rounded-pill bg-brand text-ink-inverse transition-colors hover:bg-brand-hover"
            >
              <Icon name="search" size={15} />
            </button>
          </form>
        </PageBar>

        {buildings.length === 0 ? (
          <p className="py-16 text-center text-sm text-ink-muted">
            No buildings match &ldquo;{params.q}&rdquo;.
          </p>
        ) : (
          <div className="grid gap-3.5 p-4 sm:grid-cols-2 md:p-6 xl:grid-cols-3">
            {buildings.map((building) => (
              <BuildingCard key={building.id} building={building} />
            ))}
          </div>
        )}
      </>
    );
  }

  return (
    <>
      <PageBar
        eyebrow={
          <span className="flex items-center gap-1.5">
            <Link href="/units" className="hover:text-brand">
              Buildings
            </Link>
            <span className="text-border-strong">/</span>
            <span>{scope.name}</span>
          </span>
        }
        title={scope.name}
        meta={`${units.length} ${units.length === 1 ? "unit" : "units"} · ${withWork} with open work`}
      />

      <div className="flex flex-col gap-4.5 p-4 md:p-6">
        <BuildingCard building={scope} detail />

        <section className="flex flex-col gap-3">
          <h2 className="text-base font-bold text-ink">Units</h2>
          {units.length === 0 ? (
            <p className="py-16 text-center text-sm text-ink-muted">
              No units in this building.
            </p>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
              {units.map((unit) => (
                <UnitCard key={unit.id} unit={unit} />
              ))}
            </div>
          )}
        </section>
      </div>
    </>
  );
}
