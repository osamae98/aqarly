"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import Icon from "@aqarly/ui/Icon";

const DEBOUNCE_MS = 300;

// A search box that files as you type rather than waiting on Enter or a
// click — the param updates on a short debounce, so a fast typist doesn't
// spray a request per keystroke.
export default function SearchField({ param = "q", placeholder, ariaLabel }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [term, setTerm] = useState(searchParams.get(param) ?? "");
  const timer = useRef(null);

  // A back/forward nav or another control changing the same param should be
  // reflected here too, not just this field's own edits.
  useEffect(() => {
    setTerm(searchParams.get(param) ?? "");
  }, [searchParams, param]);

  useEffect(() => () => clearTimeout(timer.current), []);

  function handleChange(event) {
    const value = event.target.value;
    setTerm(value);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => {
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
    }, DEBOUNCE_MS);
  }

  return (
    <div className="flex h-10 items-center gap-1.5 rounded-pill border border-border bg-page ps-4 pe-1 transition-[border-color,box-shadow] focus-within:border-brand focus-within:shadow-focus">
      <input
        type="search"
        value={term}
        onChange={handleChange}
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
