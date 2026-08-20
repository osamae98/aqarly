import Section from "@/components/ui/Section";
import Button from "@aqarly/ui/Button";

export default function NotFound() {
  return (
    <Section title="Page not found" description="That page does not exist.">
      <Button href="/">Back home</Button>
    </Section>
  );
}
