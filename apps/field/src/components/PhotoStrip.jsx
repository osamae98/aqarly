import SectionLabel from "./SectionLabel";

// Photos are inlined as data URLs on the request itself — there is no file
// store yet — so `next/image` has nothing to fetch or optimise here.
export default function PhotoStrip({ label, photos }) {
  if (!photos?.length) return null;

  return (
    <section className="flex flex-col gap-2.5">
      <SectionLabel>{label}</SectionLabel>
      <div className="grid grid-cols-3 gap-2.5">
        {photos.map((photo, index) => (
          <span
            key={`${photo.name}-${index}`}
            className="aspect-square overflow-hidden rounded-md border border-border bg-sunken"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={photo.dataUrl}
              alt={photo.name}
              className="size-full object-cover"
            />
          </span>
        ))}
      </div>
    </section>
  );
}
