import Link from "next/link";
import {
  formatDateTime,
  getSignedInTenant,
  getTenantNotifications,
} from "@aqarly/core/operations";
import EmptyState from "@/components/EmptyState";
import Screen from "@/components/Screen";
import SectionLabel from "@/components/SectionLabel";
import { BellOff, Check, Clock, Send, UserCheck } from "@/components/icons";

export const metadata = { title: "Notifications" };

// "Mark all read" from the design is left out on purpose: read state is a
// write, and this portal has no write path yet.
export default async function NotificationsPage() {
  const tenant = await getSignedInTenant();
  const notifications = await getTenantNotifications(tenant.id);

  const unread = notifications.filter((notification) => notification.unread);
  const earlier = notifications.filter((notification) => !notification.unread);

  return (
    <Screen title="Notifications" backHref="/">
      {notifications.length === 0 ? (
        <div className="flex flex-1 items-center justify-center">
          <EmptyState
            tone="neutral"
            icon={<BellOff size={32} />}
            title="No notifications yet"
            description="You'll get notified when your requests are assigned or completed."
          />
        </div>
      ) : (
        <div className="flex flex-col gap-6">
          {unread.length > 0 && (
            <Group label="New" notifications={unread} showDot />
          )}
          {earlier.length > 0 && <Group label="Earlier" notifications={earlier} />}
          <p className="text-center text-xs text-ink-muted">
            No older notifications
          </p>
        </div>
      )}
    </Screen>
  );
}

function Group({ label, notifications, showDot = false }) {
  return (
    <section>
      <SectionLabel className="mb-3">{label}</SectionLabel>
      <div className="flex flex-col gap-2">
        {notifications.map((notification) => (
          <NotificationRow
            key={notification.id}
            notification={notification}
            showDot={showDot}
          />
        ))}
      </div>
    </section>
  );
}

const stageIcons = {
  submitted: { Icon: Send, className: "bg-info-tint text-info" },
  assigned: {
    Icon: UserCheck,
    className: "bg-stage-assigned-tint text-stage-assigned",
  },
  "in-progress": {
    Icon: Clock,
    className: "bg-stage-in-progress-tint text-stage-in-progress",
  },
  done: { Icon: Check, className: "bg-success-tint text-success" },
};

function NotificationRow({ notification, showDot }) {
  const { Icon, className } = stageIcons[notification.stage] ?? stageIcons.submitted;

  return (
    <Link
      href={`/requests/${notification.requestId}`}
      className="flex items-start gap-3 rounded-md border border-border bg-surface p-4 transition-colors hover:bg-sunken"
    >
      <span
        className={`flex size-10 shrink-0 items-center justify-center rounded-md ${className}`}
      >
        <Icon size={18} />
      </span>
      <div className="min-w-0 flex-1">
        <p className={`text-sm text-ink ${showDot ? "font-bold" : "font-semibold"}`}>
          {notification.title}
          {showDot && (
            <span className="ml-2 inline-block size-1.5 rounded-pill bg-brand align-middle" />
          )}
        </p>
        <p className="mt-1 text-sm text-ink-soft">{notification.body}</p>
        <p className="mt-1 text-xs text-ink-muted">
          {formatDateTime(notification.at)}
        </p>
      </div>
    </Link>
  );
}
