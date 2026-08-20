import Container from "@/components/layout/Container";

export default function Section({ title, description, className = "", children }) {
  return (
    <section className={`py-12 sm:py-16 ${className}`}>
      <Container>
        {title && (
          <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">
            {title}
          </h2>
        )}
        {description && (
          <p className="mt-2 max-w-2xl text-foreground/70">{description}</p>
        )}
        {children && <div className="mt-8">{children}</div>}
      </Container>
    </section>
  );
}
