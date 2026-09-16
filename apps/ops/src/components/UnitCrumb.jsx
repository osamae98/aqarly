import Link from "next/link";

// Buildings / building / unit — with `current` set, the unit becomes a link
// back and `current` names the page underneath it.
export default function UnitCrumb({ unit, current }) {
  return (
    <span className="flex flex-wrap items-center gap-1.5">
      <Link href="/units" className="hover:text-brand">
        Buildings
      </Link>
      <span className="text-border-strong">/</span>
      <Link href={`/units?propertyId=${unit.propertyId}`} className="hover:text-brand">
        {unit.property?.name}
      </Link>
      <span className="text-border-strong">/</span>
      {current ? (
        <>
          <Link href={`/units/${unit.id}`} className="font-mono hover:text-brand">
            {unit.label}
          </Link>
          <span className="text-border-strong">/</span>
          <span>{current}</span>
        </>
      ) : (
        <span className="font-mono">{unit.label}</span>
      )}
    </span>
  );
}
