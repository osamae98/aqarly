"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import Badge from "@aqarly/ui/Badge";
import Icon from "@aqarly/ui/Icon";
import AssignPanel from "@/components/AssignPanel";
import ColumnFilter from "@/components/ColumnFilter";
import ConfirmDialog from "@/components/ConfirmDialog";
import Initials from "@/components/Initials";
import Toast from "@/components/Toast";
import { useFormAction } from "@/components/Field";
import { deleteRequestsAction, setPriorityAction } from "@/app/actions";
import {
  stageLabels,
  stageTones,
  tierLabels,
  tierTones,
} from "@aqarly/core/operations";

// One row per request. The mockup lays these out as a grid rather than a
// table so the unit and assignee cells can each stack two lines. Priority
// (why it matters) and status (where it's at) are different questions, so
// each gets its own column rather than one stacking on the other.
const GRID =
  "grid grid-cols-[34px_92px_minmax(0,1fr)_140px_112px_112px_150px_40px] items-center gap-3.5";

export default function RequestRows({
  requests,
  staff,
  filters,
  searchParams,
  page = 1,
  pageCount = 1,
  pageSize = requests.length,
  total = requests.length,
}) {
  const router = useRouter();
  const [selected, setSelected] = useState([]);
  const [assignOpen, setAssignOpen] = useState(false);
  const [priorityOpen, setPriorityOpen] = useState(false);
  // What the confirm dialog is about to remove: one row's ids, or the whole
  // selection. Removal is not recoverable, so nothing here happens on a click.
  const [removing, setRemoving] = useState(null);

  // A finished bulk action has nothing left to act on.
  const {
    submit: changePriority,
    pending: priorityPending,
    result: priorityResult,
  } = useFormAction(setPriorityAction, {
    onSuccess: () => {
      setPriorityOpen(false);
      setSelected([]);
    },
  });

  const {
    submit: removeRequests,
    pending: removePending,
    result: removeResult,
    reset: resetRemove,
  } = useFormAction(deleteRequestsAction, {
    onSuccess: () => {
      setRemoving(null);
      setSelected([]);
    },
  });

  function confirmRemove() {
    const form = new FormData();
    for (const id of removing.ids) form.append("id", id);
    removeRequests(form);
  }

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
          {priorityOpen ? (
            <form action={changePriority} className="flex items-center gap-2">
              {selected.map((id) => (
                <input key={id} type="hidden" name="id" value={id} />
              ))}
              <span className="text-[13px] text-brand">Change to</span>
              {[
                { value: "urgent", label: "Emergency" },
                { value: "normal", label: "Standard" },
              ].map((option) => (
                <button
                  key={option.value}
                  type="submit"
                  name="priority"
                  value={option.value}
                  disabled={priorityPending}
                  className="cursor-pointer rounded-pill border border-[var(--green-200)] bg-surface px-3.5 py-1.5 text-[13px] font-semibold text-brand transition-colors hover:bg-page disabled:opacity-45"
                >
                  {option.label}
                </button>
              ))}
              <button
                type="button"
                onClick={() => setPriorityOpen(false)}
                className="cursor-pointer text-[13px] text-ink-soft hover:text-ink"
              >
                Cancel
              </button>
            </form>
          ) : (
            <button
              type="button"
              onClick={() => setPriorityOpen(true)}
              className="cursor-pointer rounded-pill border border-[var(--green-200)] px-3.5 py-1.5 text-[13px] font-semibold text-brand transition-colors hover:bg-surface"
            >
              Change priority
            </button>
          )}
          <button
            type="button"
            onClick={() => {
              resetRemove();
              setRemoving({
                ids: selected,
                label: `${selected.length} ${selected.length === 1 ? "request" : "requests"}`,
              });
            }}
            className="cursor-pointer rounded-pill border border-border-strong px-3.5 py-1.5 text-[13px] font-semibold text-danger transition-colors hover:bg-surface"
          >
            Remove
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

      <div className="min-w-[70rem] px-4 md:px-6">
        {/* One bordered, rounded card around the header and every row, the
          * way every other surface in the app reads — rather than the queue
          * bleeding straight into the page. Only the rows/pagination below
          * clip to the radius: the header holds the filter dropdowns, and
          * those have to be able to overhang the card rather than get cut
          * off by it. */}
        <div className="rounded-md border border-border bg-surface">
          <div className={`${GRID} border-b border-border px-3 py-3`}>
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
              param="category"
              searchParams={searchParams}
              options={filters.category}
            />
            <ColumnFilter
              label="Building"
              param="propertyId"
              searchParams={searchParams}
              options={filters.property}
            />
            <ColumnFilter
              label="Priority"
              param="tier"
              searchParams={searchParams}
              options={filters.tier}
            />
            <ColumnFilter
              label="Status"
              param="stage"
              searchParams={searchParams}
              options={filters.stage}
            />
            <ColumnFilter
              label="Assigned to"
              param="assigneeId"
              searchParams={searchParams}
              options={filters.assignee}
            />
            <span className="sr-only">Actions</span>
          </div>

          <div className="overflow-hidden rounded-b-md">
          <div className="max-h-[60vh] divide-y divide-sunken overflow-y-auto">
            {requests.length === 0 && (
              <p className="px-3 py-16 text-center text-sm text-ink-muted">
                No requests match these filters.
              </p>
            )}

            {requests.map((request) => (
              <div
                key={request.id}
                onClick={() => router.push(`/requests/${request.id}`)}
                className={`${GRID} min-h-14 cursor-pointer bg-surface px-3 transition-colors hover:bg-page`}
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

                <span className="min-w-0 truncate text-[14.5px] font-medium text-ink">
                  {request.summary}
                </span>

                {/* The column filters by building, so the building is what
                  * the cell leads with and the unit is the detail under it. */}
                <span className="min-w-0">
                  <span className="block truncate text-[13.5px] font-semibold text-ink">
                    {request.property?.name ?? "—"}
                  </span>
                  <span className="block truncate text-[11.5px] text-ink-muted">
                    Unit {request.unit?.label ?? "—"}
                  </span>
                </span>

                <span>
                  <Badge tone={tierTones[request.tier]} dot={false}>
                    {tierLabels[request.tier]}
                  </Badge>
                </span>

                <span>
                  <Badge tone={stageTones[request.stage]} dot={false}>
                    {stageLabels[request.stage]}
                  </Badge>
                </span>

                <span className="flex min-w-0 items-center gap-2.5">
                  {request.assignee ? (
                    <>
                      <Initials name={request.assignee.name} size={26} />
                      <span className="min-w-0 truncate text-[13px] font-semibold text-ink">
                        {request.assignee.name}
                      </span>
                    </>
                  ) : (
                    // Pressure here reads off what's unassigned, so this is
                    // the one cell that should look like it needs attention
                    // rather than quietly say nothing is happening.
                    <Badge tone="warning" dot={false}>
                      Unassigned
                    </Badge>
                  )}
                </span>

                <span onClick={(event) => event.stopPropagation()}>
                  <button
                    type="button"
                    onClick={() => {
                      resetRemove();
                      setRemoving({ ids: [request.id], label: request.id });
                    }}
                    aria-label={`Remove ${request.id}`}
                    title={`Remove ${request.id}`}
                    className="flex cursor-pointer rounded-pill p-1.5 text-ink-muted transition-colors hover:bg-danger-tint hover:text-danger"
                  >
                    <Icon name="trash-2" size={15} />
                  </button>
                </span>
              </div>
            ))}
          </div>
          </div>
        </div>
      </div>

      {/* Outside the horizontally-scrolling card on purpose — the count and
        * the prev/next controls need to stay on screen no matter how far
        * right the table itself has been scrolled. */}
      {requests.length > 0 && (
        <div className="px-4 md:px-6">
          <Pagination
            page={page}
            pageCount={pageCount}
            pageSize={pageSize}
            total={total}
            searchParams={searchParams}
          />
        </div>
      )}

      <AssignPanel
        open={assignOpen}
        onClose={() => setAssignOpen(false)}
        candidates={staff}
        requestIds={selected}
        onAssigned={() => setSelected([])}
        eyebrow={`${selected.length} selected`}
        title={`Assign ${selected.length} ${selected.length === 1 ? "request" : "requests"}`}
        description="Ranked by how much room each person has left in their day."
      />

      <ConfirmDialog
        open={Boolean(removing)}
        onClose={() => setRemoving(null)}
        title="Remove from the queue"
        description={`${removing?.label ?? "This request"} will be taken out of the queue, and out of every rollup it was counted in.`}
        confirmLabel="Remove"
        pending={removePending}
        result={removeResult}
        onConfirm={confirmRemove}
      />

      <Toast
        message={
          removeResult?.ok
            ? removeResult.message
            : priorityResult?.ok
              ? priorityResult.message
              : null
        }
      />
    </>
  );
}

// Which page numbers get their own button versus collapsing into an
// ellipsis — first, last, and a window around the current page, the way
// most paged lists read once there are more pages than fit.
function pageNumbers(page, pageCount) {
  const pages = new Set([1, pageCount, page - 1, page, page + 1]);
  const sorted = [...pages].filter((p) => p >= 1 && p <= pageCount).sort((a, b) => a - b);

  const result = [];
  for (const p of sorted) {
    if (result.length > 0 && p - result[result.length - 1] > 1) result.push("…");
    result.push(p);
  }
  return result;
}

function pageHref(pageNum, searchParams) {
  const params = new URLSearchParams(
    Object.entries(searchParams).filter(([, v]) => typeof v === "string"),
  );
  if (pageNum <= 1) {
    params.delete("page");
  } else {
    params.set("page", String(pageNum));
  }
  const query = params.toString();
  return query ? `/requests?${query}` : "/requests";
}

// The queue is sorted server-side already, so a page is just a window over
// that same order — every link here only ever changes `page`.
function Pagination({ page, pageCount, pageSize, total, searchParams }) {
  const from = (page - 1) * pageSize + 1;
  const to = Math.min(page * pageSize, total);

  return (
    <div className="mt-2 flex flex-wrap items-center justify-between gap-3 rounded-md border border-border bg-surface px-3 py-3">
      <span className="text-[12.5px] text-ink-muted">
        {from}–{to} of {total} requests
      </span>

      <div className="flex items-center gap-1">
        <PageLink
          href={pageHref(page - 1, searchParams)}
          disabled={page <= 1}
          label="Previous page"
        >
          <Icon name="chevron-right" size={14} className="rotate-180" />
        </PageLink>

        {pageCount > 1 &&
          pageNumbers(page, pageCount).map((entry, index) =>
            entry === "…" ? (
              <span
                key={`ellipsis-${index}`}
                className="px-1.5 text-[12.5px] text-ink-muted"
              >
                …
              </span>
            ) : (
              <PageLink
                key={entry}
                href={pageHref(entry, searchParams)}
                current={entry === page}
                label={`Page ${entry}`}
              >
                {entry}
              </PageLink>
            ),
          )}

        <PageLink
          href={pageHref(page + 1, searchParams)}
          disabled={page >= pageCount}
          label="Next page"
        >
          <Icon name="chevron-right" size={14} />
        </PageLink>
      </div>
    </div>
  );
}

function PageLink({ href, disabled, current, label, children }) {
  const classes = [
    "flex size-8 shrink-0 items-center justify-center rounded-sm text-[13px] font-semibold transition-colors",
    current
      ? "bg-brand-tint text-brand"
      : disabled
        ? "cursor-not-allowed text-ink-muted opacity-40"
        : "cursor-pointer text-ink-soft hover:bg-sunken",
  ].join(" ");

  if (disabled) {
    return (
      <span aria-hidden="true" className={classes}>
        {children}
      </span>
    );
  }

  return (
    <Link
      href={href}
      aria-label={label}
      aria-current={current ? "page" : undefined}
      className={classes}
    >
      {children}
    </Link>
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
