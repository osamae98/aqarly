import Section from "@/components/ui/Section";
import { getProperties } from "@/lib/properties";

export const metadata = { title: "Properties" };

export default async function PropertiesPage() {
  const properties = await getProperties();

  return (
    <Section
      title="Properties"
      description="TODO: filters (purpose, type, price, bedrooms) and a listing grid."
    >
      <p className="text-sm text-foreground/60">
        {properties.length} record(s) in the seed data.
      </p>
    </Section>
  );
}
