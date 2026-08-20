import Container from "./Container";
import { site } from "@/lib/site";

export default function Footer() {
  return (
    <footer className="mt-auto border-t border-black/10 py-8 text-sm text-foreground/60 dark:border-white/10">
      <Container className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <p>
          &copy; {new Date().getFullYear()} {site.name}. All rights reserved.
        </p>
        <p>{site.contact.email}</p>
      </Container>
    </footer>
  );
}
