"use client";

import { formatDateTime } from "@aqarly/core/labels";
import Icon from "@aqarly/ui/Icon";
import { approveRegistrationAction, declineRegistrationAction } from "@/app/actions";
import { FormNote, useFormAction } from "@/components/Field";
import Initials from "@/components/Initials";
import Toast from "@/components/Toast";

// Tenants who registered themselves, one card each, oldest first. Ops holds
// the leases, so ops is who can say whether someone lives where they claim.
// A unit that already has a tenant says so on the card before anything is
// pressed: approving replaces them, and the button says that too.
export default function RegistrationRows({ registrations }) {
  const approve = useFormAction(approveRegistrationAction);
  const decline = useFormAction(declineRegistrationAction);
  const done = approve.result?.ok ? approve.result : decline.result?.ok ? decline.result : null;
  const failed = approve.result?.error ? approve.result : decline.result;
  const pending = approve.pending || decline.pending;

  return (
    <div className="flex flex-col gap-3">
      <FormNote state={failed} />

      {registrations.map((registration) => {
        const replacing = registration.currentTenant;

        return (
          <div
            key={registration.id}
            className="flex flex-wrap items-start gap-4 rounded-md border border-border bg-surface p-4"
          >
            <span className="flex min-w-0 flex-[1_1_16rem] items-start gap-3">
              <Initials name={registration.name} size={38} />
              <span className="flex min-w-0 flex-col gap-1">
                <span className="text-[15px] font-semibold text-ink">{registration.name}</span>
                <a
                  href={`tel:${registration.phone.replace(/[^\d+]/g, "")}`}
                  className="font-mono text-[13px] text-ink-soft hover:text-brand"
                >
                  {registration.phone}
                </a>
                <span className="text-[13px] text-ink">
                  Unit {registration.unit.label} · {registration.property.name}
                </span>
                <span className="text-xs text-ink-muted">
                  Registered {formatDateTime(registration.createdAt)}
                </span>
                {replacing && (
                  <span className="mt-1 flex items-start gap-1.5 rounded-sm bg-warning-tint px-2.5 py-1.5 text-[12.5px] text-warning-ink">
                    <Icon name="alert-triangle" size={14} className="mt-0.5 shrink-0" />
                    <span>
                      {replacing.name} ({replacing.phone}) is this unit&rsquo;s tenant now.
                      Approving replaces them.
                    </span>
                  </span>
                )}
              </span>
            </span>

            <span className="flex items-center gap-2">
              <form action={decline.submit}>
                <input type="hidden" name="id" value={registration.id} />
                <button
                  type="submit"
                  disabled={pending}
                  className="cursor-pointer rounded-pill border-[1.5px] border-border-strong px-4 py-2 text-[13.5px] font-semibold text-ink transition-colors hover:bg-sunken disabled:cursor-not-allowed disabled:opacity-45"
                >
                  Decline
                </button>
              </form>
              <form action={approve.submit}>
                <input type="hidden" name="id" value={registration.id} />
                <button
                  type="submit"
                  disabled={pending}
                  className="cursor-pointer rounded-pill bg-brand px-4 py-2 text-[13.5px] font-semibold text-ink-inverse transition-colors hover:bg-brand-hover disabled:cursor-not-allowed disabled:opacity-45"
                >
                  {replacing ? "Approve and replace" : "Approve"}
                </button>
              </form>
            </span>
          </div>
        );
      })}

      <Toast message={done?.message ?? null} />
    </div>
  );
}
