import Link from "next/link";
import Screen from "@/components/Screen";
import { Broom, ChevronRight, Wrench } from "@/components/icons";

export const metadata = { title: "New request" };

const options = [
  {
    href: "/requests/new/maintenance",
    title: "Maintenance",
    description: "AC, plumbing, electrical, appliances",
    Icon: Wrench,
    className: "bg-category-maintenance-tint text-category-maintenance",
  },
  {
    href: "/requests/new/housekeeping",
    title: "Housekeeping",
    description: "Cleaning service with upfront pricing",
    Icon: Broom,
    className: "bg-category-housekeeping-tint text-category-housekeeping",
  },
];

export default function NewRequestPage() {
  return (
    <Screen title="New Request" backHref="/" className="justify-center">
      <h2 className="text-center text-xl font-bold text-ink">
        What do you need help with?
      </h2>
      <p className="mb-10 mt-1 text-center text-sm text-ink-soft">
        Choose a request type to get started
      </p>

      <div className="flex flex-col gap-4 md:mx-auto md:w-full md:max-w-lg">
        {options.map(({ href, title, description, Icon, className }) => (
          <Link
            key={href}
            href={href}
            className="flex items-center gap-4 rounded-lg border border-border bg-surface p-5 transition hover:-translate-y-0.5 hover:shadow-md"
          >
            <span
              className={`flex size-13 shrink-0 items-center justify-center rounded-lg ${className}`}
            >
              <Icon size={26} />
            </span>
            <span className="flex-1">
              <span className="block text-base font-semibold text-ink">
                {title}
              </span>
              <span className="block text-sm text-ink-soft">{description}</span>
            </span>
            <ChevronRight size={18} className="shrink-0 text-ink-muted" />
          </Link>
        ))}
      </div>
    </Screen>
  );
}
