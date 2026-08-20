import Section from "@/components/ui/Section";
import { site } from "@/lib/site";

export const metadata = { title: "Contact" };

export default function ContactPage() {
  return (
    <Section title="Contact" description="TODO: enquiry form and office details.">
      <dl className="space-y-2 text-sm">
        <div className="flex gap-2">
          <dt className="text-foreground/60">Email</dt>
          <dd>{site.contact.email}</dd>
        </div>
        <div className="flex gap-2">
          <dt className="text-foreground/60">Phone</dt>
          <dd>{site.contact.phone}</dd>
        </div>
      </dl>
    </Section>
  );
}
