import Link from "next/link";
import Button from "@aqarly/ui/Button";
import {
  getRequests,
  getSignedInTenant,
  getTenantNotifications,
} from "@aqarly/core/operations";
import EmptyState from "@/components/EmptyState";
import RequestCard from "@/components/RequestCard";
import Screen from "@/components/Screen";
import SectionLabel from "@/components/SectionLabel";
import {
  Bell,
  CheckCircle,
  ChevronDown,
  ChevronRight,
  FilePlus,
  Plus,
} from "@/components/icons";

// How much of the completed history the dashboard shows before the tenant
// has to go to the History tab for the rest.
const RECENT_LIMIT = 3;

export default async function MyRequestsPage({ searchParams }) {
  const { recent } = await searchParams;
  const collapsed = recent === "collapsed";

  const tenant = await getSignedInTenant();
  const [requests, notifications] = await Promise.all([
    getRequests({ tenantId: tenant.id, sort: "newest" }),
    getTenantNotifications(tenant.id),
  ]);

  const active = requests.filter((request) => request.stage !== "done");
  const done = requests.filter((request) => request.stage === "done");
  const unread = notifications.filter((notification) => notification.unread).length;

  return (
    <Screen title="My Requests" action={<NotificationsBell unread={unread} />}>
      <p className="mb-4 text-xl font-bold text-ink">
        Hala, {tenant.name.split(" ")[0]}
      </p>

      {requests.length === 0 ? (
        <div className="flex flex-1 items-center justify-center">
          <EmptyState
            icon={<FilePlus size={32} />}
            title="No requests yet"
            description="Submit your first maintenance or housekeeping request when you need help."
            action={<Button href="/requests/new">New request</Button>}
          />
        </div>
      ) : (
        <div className="flex flex-col gap-6 md:grid md:grid-cols-2 md:items-start">
          <section>
            <SectionLabel className="mb-3">Active</SectionLabel>
            {active.length ? (
              <div className="flex flex-col gap-4">
                {active.map((request) => (
                  <RequestCard key={request.id} request={request} />
                ))}
              </div>
            ) : (
              <EmptyState
                tone="success"
                icon={<CheckCircle size={32} />}
                title="All caught up!"
                description="You have no active requests. Your recent work shows below."
              />
            )}
          </section>

          {done.length > 0 && (
            <section>
              <Link
                href={collapsed ? "/" : "/?recent=collapsed"}
                className="mb-3 flex items-center justify-between gap-3 text-ink-soft transition-colors hover:text-ink"
              >
                <SectionLabel>
                  {collapsed ? `Recent (${done.length})` : "Recent"}
                </SectionLabel>
                {collapsed ? <ChevronRight size={16} /> : <ChevronDown size={16} />}
              </Link>
              {!collapsed && (
                <div className="flex flex-col gap-4">
                  {done.slice(0, RECENT_LIMIT).map((request) => (
                    <RequestCard key={request.id} request={request} />
                  ))}
                  {done.length > RECENT_LIMIT && (
                    <Link
                      href="/history"
                      className="text-sm font-medium text-brand transition-colors hover:text-brand-hover"
                    >
                      See all {done.length} in History →
                    </Link>
                  )}
                </div>
              )}
            </section>
          )}
        </div>
      )}

      {/* Keeps the last card clear of the floating button below, which
          overlaps scrolled content since it sits outside the flow. */}
      <div aria-hidden className="h-24 md:h-16" />

      <NewRequestButton />
    </Screen>
  );
}

function NotificationsBell({ unread }) {
  return (
    <Link
      href="/notifications"
      aria-label={unread ? `Notifications (${unread} new)` : "Notifications"}
      className="relative flex items-center text-ink transition-colors hover:text-brand"
    >
      <Bell size={22} />
      {unread > 0 && (
        <span className="absolute -right-0.5 -top-0.5 size-2 rounded-pill bg-brand" />
      )}
    </Link>
  );
}

// The design reaches the new-request flow from the empty state only; a
// standing action keeps it reachable once there are requests on screen.
function NewRequestButton() {
  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-18 z-20 mx-auto flex w-full max-w-md justify-center px-4 md:bottom-6 md:max-w-5xl md:px-6">
      <Button
        href="/requests/new"
        className="pointer-events-auto shadow-lg"
        iconLeft={<Plus size={18} />}
      >
        New request
      </Button>
    </div>
  );
}
