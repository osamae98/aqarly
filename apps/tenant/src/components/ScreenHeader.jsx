import Link from "next/link";
import { HeaderNav } from "./NavLinks";
import { ChevronLeft } from "./icons";

// Every screen in the design opens with the same bar: an optional back
// affordance, the screen title, and at most one action on the right.
export default function ScreenHeader({ title, backHref, action }) {
  return (
    <header className="sticky top-0 z-10 flex items-center gap-4 border-b border-border bg-surface px-4 py-4">
      {backHref && (
        <Link
          href={backHref}
          aria-label="Back"
          className="flex items-center text-ink transition-colors hover:text-brand"
        >
          <ChevronLeft size={20} />
        </Link>
      )}
      <h1 className="flex-1 truncate text-base font-semibold text-ink">
        {title}
      </h1>
      <HeaderNav />
      {action}
    </header>
  );
}
