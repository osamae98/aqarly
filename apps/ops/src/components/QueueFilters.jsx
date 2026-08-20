import Link from "next/link";

function hrefWith(params, key, value) {
  const next = new URLSearchParams(params);
  if (value === null) {
    next.delete(key);
  } else {
    next.set(key, value);
  }
  const query = next.toString();
  return query ? `/requests?${query}` : "/ops/requests";
}

function FilterGroup({ label, name, options, params }) {
  const active = params.get(name);

  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="text-xs font-medium text-ink-muted">{label}</span>
      {options.map((option) => {
        const isActive = active === option.value || (!active && option.value === null);
        return (
          <Link
            key={option.label}
            href={hrefWith(params, name, option.value)}
            className={[
              "rounded-pill border-[1.5px] px-3 py-1 text-xs transition-colors",
              isActive
                ? "border-transparent bg-brand text-ink-inverse"
                : "border-border-strong text-ink-soft hover:bg-sunken",
            ].join(" ")}
          >
            {option.label}
          </Link>
        );
      })}
    </div>
  );
}

export default function QueueFilters({ searchParams, properties }) {
  const params = new URLSearchParams(
    Object.entries(searchParams).filter(([, v]) => typeof v === "string"),
  );

  return (
    <div className="flex flex-col gap-3 rounded-lg border border-border bg-surface p-4">
      <FilterGroup
        label="Stage"
        name="stage"
        params={params}
        options={[
          { label: "All", value: null },
          { label: "Submitted", value: "submitted" },
          { label: "Assigned", value: "assigned" },
          { label: "In progress", value: "in-progress" },
          { label: "Done", value: "done" },
        ]}
      />
      <FilterGroup
        label="Type"
        name="type"
        params={params}
        options={[
          { label: "All", value: null },
          { label: "Maintenance", value: "maintenance" },
          { label: "Housekeeping", value: "housekeeping" },
        ]}
      />
      <FilterGroup
        label="SLA"
        name="sla"
        params={params}
        options={[
          { label: "All", value: null },
          { label: "Overdue", value: "overdue" },
          { label: "At risk", value: "at-risk" },
          { label: "On track", value: "on-track" },
        ]}
      />
      <FilterGroup
        label="Property"
        name="propertyId"
        params={params}
        options={[
          { label: "All", value: null },
          ...properties.map((p) => ({ label: p.name, value: p.id })),
        ]}
      />
      <FilterGroup
        label="Sort"
        name="sort"
        params={params}
        options={[
          { label: "Oldest first", value: null },
          { label: "Newest first", value: "newest" },
          { label: "SLA pressure", value: "sla" },
        ]}
      />
    </div>
  );
}
