import Section from "@/components/ui/Section";
import { getProperties } from "@aqarly/core/properties";

export const metadata = { title: "Properties" };

// Listings come from aqarly-api, read when the page is requested: nothing is
// prerendered, so `next build` doesn't need the API running.
export const dynamic = "force-dynamic";

export default async function PropertiesPage() {
  const properties = await getProperties();

  return (
    <Section
      title="Properties"
      description="TODO: filters (purpose, type, price, bedrooms) and a listing grid."
    >
      <p className="text-sm text-foreground/60">
        {properties.length} listing(s) from the API.
      </p>
    </Section>
  );
}
