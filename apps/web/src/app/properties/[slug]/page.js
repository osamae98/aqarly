import { notFound } from "next/navigation";
import Section from "@/components/ui/Section";
import { getPropertyBySlug, getPropertySlugs } from "@/lib/properties";

export async function generateStaticParams() {
  const slugs = await getPropertySlugs();
  return slugs.map((slug) => ({ slug }));
}

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
