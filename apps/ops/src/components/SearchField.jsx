"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import Icon from "@aqarly/ui/Icon";

const DEBOUNCE_MS = 800;
// One letter matches almost everything, so it isn't worth a round trip —
// wait for something worth filtering on.
const MIN_QUERY_LENGTH = 2;

// A search box that filters as you type. Typing itself applies the filter — a
// submit button with nothing to submit to would be furniture — so this only
// debounces the navigation rather than waiting on an Enter or a click.
export default function SearchField({ param = "q", placeholder, ariaLabel }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const current = searchParams.get(param) ?? "";
  const [term, setTerm] = useState(current);
  const timer = useRef(null);
  // What we last sent the router — if the URL's param differs from this, the
  // change came from outside (the back button, a filter cleared elsewhere),
  // so the box should pick it up rather than keep showing a stale query.
  const [lastSubmitted, setLastSubmitted] = useState(current);

  if (current !== lastSubmitted) {
    setLastSubmitted(current);
    setTerm(current);
  }

  useEffect(() => () => clearTimeout(timer.current), []);

  function go(value) {
    setLastSubmitted(value.trim() ? value : "");
    const next = new URLSearchParams(searchParams);
    if (value.trim()) {
      next.set(param, value);
    } else {
      next.delete(param);
    }
    const query = next.toString();
    router.replace(query ? `${pathname}?${query}` : pathname, {
      scroll: false,
    });
  }

  function onChange(event) {
    const value = event.target.value;
    setTerm(value);
    clearTimeout(timer.current);

    // A single stray letter just sits in the box rather than searching —
    // clearing back to empty still goes through, so it always resets the
    // list on its own.
    if (value.trim().length > 0 && value.trim().length < MIN_QUERY_LENGTH) {
      return;
    }
    timer.current = setTimeout(() => go(value), DEBOUNCE_MS);
  }

  return (
    <div className="flex h-10 items-center gap-1.5 rounded-pill border border-border bg-page ps-4 pe-1 transition-[border-color,box-shadow] focus-within:border-brand focus-within:shadow-focus">
      <input
        type="search"
        value={term}
        onChange={onChange}
        placeholder={placeholder}
        aria-label={ariaLabel}
        className="w-full min-w-0 bg-transparent text-[13.5px] text-ink placeholder:text-ink-muted focus:outline-none sm:w-52"
      />
      <span className="flex size-8 shrink-0 items-center justify-center rounded-pill bg-brand text-ink-inverse">
        <Icon name="search" size={15} />
      </span>
    </div>
  );
}
