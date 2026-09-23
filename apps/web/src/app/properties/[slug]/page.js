import { notFound } from "next/navigation";
import Section from "@/components/ui/Section";
import { getPropertyBySlug } from "@aqarly/core/properties";

// Read from aqarly-api when requested rather than prerendered from a slug list
// at build time, so `next build` doesn't need the API running and a new
// listing shows without a rebuild.
export const dynamic = "force-dynamic";

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const property = await getPropertyBySlug(slug);
  return { title: property?.title ?? "Property" };
}

export default async function PropertyPage({ params }) {
  const { slug } = await params;
  const property = await getPropertyBySlug(slug);

  if (!property) notFound();

  return (
    <Section
      title={property.title}
      description="TODO: gallery, key facts, description, map, enquiry form."
    />
  );
}
