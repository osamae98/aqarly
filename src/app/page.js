import Container from "@/components/layout/Container";
import Section from "@/components/ui/Section";
import Button from "@/components/ui/Button";
import { site } from "@/lib/site";

export default function HomePage() {
  return (
    <>
      <Container className="py-20 sm:py-28">
        <h1 className="max-w-3xl text-4xl font-semibold tracking-tight sm:text-5xl">
          {site.tagline}
        </h1>
        <p className="mt-4 max-w-xl text-lg text-foreground/70">
          {site.description}
        </p>
        <div className="mt-8 flex gap-3">
          <Button href="/properties">Browse properties</Button>
          <Button href="/contact" variant="outline">
            Talk to us
          </Button>
        </div>
      </Container>

      <Section
        title="Featured properties"
        description="TODO: pull featured listings via getProperties({ featured: true })."
      />
    </>
  );
}
