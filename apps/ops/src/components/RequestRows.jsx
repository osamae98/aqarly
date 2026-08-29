"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import Badge from "@aqarly/ui/Badge";
import AssignPanel from "@/components/AssignPanel";
import ColumnFilter from "@/components/ColumnFilter";
import Initials from "@/components/Initials";
import { categoryLabels, stageLabels } from "@aqarly/core/operations";

// One row per request. The mockup lays these out as a grid rather than a
// table so the unit, priority, and assignee cells can each stack two lines.
const GRID =
  "grid grid-cols-[34px_78px_minmax(0,1fr)_142px_104px_160px] items-center gap-3.5";

export default function RequestRows({ requests, staff, filters, searchParams }) {
  const router = useRouter();
  const [selected, setSelected] = useState([]);
  const [assignOpen, setAssignOpen] = useState(false);

  const params = new URLSearchParams(
    Object.entries(searchParams).filter(([, v]) => typeof v === "string"),
  );

  const allOn = requests.length > 0 && selected.length === requests.length;

  function toggle(id) {
    setSelected((current) =>
      current.includes(id)
        ? current.filter((value) => value !== id)
        : [...current, id],
    );
  }

  return (
    <>
      {selected.length > 0 && (
        <div className="flex flex-wrap items-center gap-3.5 border-y border-[var(--green-100)] bg-brand-tint px-4 py-2.5 md:px-6">
          <span className="text-[13.5px] font-semibold text-brand">
            {selected.length} selected
          </span>
          <span className="h-4.5 w-px bg-[var(--green-200)]" />
          <button
            type="button"
            onClick={() => setAssignOpen(true)}
            className="cursor-pointer rounded-pill bg-brand px-3.5 py-1.5 text-[13px] font-semibold text-ink-inverse transition-colors hover:bg-brand-hover"
          >
            Assign to technician
          </button>
          <button
            type="button"
            disabled
            title="Changing priority needs a write path"
            className="cursor-not-allowed rounded-pill border border-[var(--green-200)] px-3.5 py-1.5 text-[13px] font-semibold text-brand opacity-45"
          >
            Change priority
          </button>
          <span className="flex-1" />
          <button
            type="button"
            onClick={() => setSelected([])}
            className="cursor-pointer text-[13px] text-ink-soft hover:text-ink"
          >
            Clear
          </button>
        </div>
      )}

      <div className="min-w-[56rem] px-4 md:px-6">
        <div className={`${GRID} px-3 pt-3 pb-2`}>
          <span>
            <Checkbox
              checked={allOn}
              label="Select every request"
              onChange={() =>
                setSelected(allOn ? [] : requests.map((r) => r.id))
              }
            />
          </span>
          <span className="text-[11px] font-bold tracking-[0.1em] uppercase text-ink-muted">
            Ref
          </span>
          <ColumnFilter
            label="Request"
            param="type"
            params={params}
            options={filters.type}
          />
          <ColumnFilter
            label="Unit"
            param="propertyId"
            params={params}
            options={filters.property}
          />
          <ColumnFilter
            label="Priority"
            param="priority"
            params={params}
            options={filters.priority}
          />
          <ColumnFilter
            label="Assignee"
            param="assigneeId"
            params={params}
            options={filters.assignee}
          />
        </div>

        <div className="border-t border-border">
          {requests.length === 0 && (
            <p className="px-3 py-16 text-center text-sm text-ink-muted">
              No requests match these filters.
            </p>
          )}

          {requests.map((request) => (
            <div
              key={request.id}
              onClick={() => router.push(`/requests/${request.id}`)}
              className={`${GRID} min-h-14 cursor-pointer border-b border-sunken bg-surface px-3 transition-colors hover:bg-page`}
            >
              <span onClick={(event) => event.stopPropagation()}>
                <Checkbox
                  checked={selected.includes(request.id)}
                  label={`Select ${request.id}`}
                  onChange={() => toggle(request.id)}
                />
              </span>

              <span className="min-w-0">
                <Link
                  href={`/requests/${request.id}`}
                  onClick={(event) => event.stopPropagation()}
                  className="block truncate font-mono text-[12.5px] text-ink-muted hover:text-brand"
                >
                  {request.id}
                </Link>
              </span>

              <span className="min-w-0">
                <span className="block truncate text-[14.5px] font-medium text-ink">
                  {request.summary}
                </span>
                <span className="block truncate text-[11.5px] text-ink-muted">
                  {categoryLabels[request.category] ?? request.category}
                </span>
              </span>

              <span className="min-w-0">
                <span className="block truncate text-[13.5px] font-semibold text-ink">
                  Unit {request.unit?.label ?? "—"}
                </span>
                <span className="block truncate text-[11.5px] text-ink-muted">
                  {request.property?.name ?? "—"}
                </span>
              </span>

              <span>
                {request.priority === "urgent" ? (
                  <Badge tone="danger" dot={false}>
                    Emergency
                  </Badge>
                ) : (
                  <Badge tone="neutral" dot={false}>
                    Standard
                  </Badge>
                )}
              </span>

              <span className="flex min-w-0 items-center gap-2.5">
                {request.assignee ? (
                  <>
                    <Initials name={request.assignee.name} size={26} />
                    <span className="min-w-0">
                      <span className="block truncate text-[13px] font-semibold text-ink">
                        {request.assignee.name}
                      </span>
                      <span className="block truncate text-[11.5px] text-ink-muted">
                        {stageLabels[request.stage]}
                      </span>
                    </span>
                  </>
                ) : (
                  <span className="text-[13px] text-ink-muted">Unassigned</span>
                )}
              </span>
            </div>
          ))}
        </div>
      </div>

      <AssignPanel
        open={assignOpen}
        onClose={() => setAssignOpen(false)}
        candidates={staff}
        eyebrow={`${selected.length} selected`}
        title={`Assign ${selected.length} ${selected.length === 1 ? "request" : "requests"}`}
        description="Ranked by how much room each person has left in their day."
      />
    </>
  );
}

// The mockup's 18px rounded box, kept as a real checkbox so it stays
// keyboard-reachable and announces its state.
function Checkbox({ checked, label, onChange }) {
  return (
    <input
      type="checkbox"
      checked={checked}
      onChange={onChange}
      aria-label={label}
      className="size-4.5 cursor-pointer appearance-none rounded-[5px] border-[1.5px] border-border-strong bg-surface transition-colors checked:border-brand checked:bg-brand focus-visible:shadow-focus focus-visible:outline-none checked:after:block checked:after:text-center checked:after:text-[11px] checked:after:leading-4 checked:after:font-bold checked:after:text-[var(--sand-0)] checked:after:content-['✓']"
    />
  );
}
