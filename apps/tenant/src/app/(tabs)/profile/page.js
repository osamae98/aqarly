import Link from "next/link";
import Avatar from "@aqarly/ui/Avatar";
import Button from "@aqarly/ui/Button";
import { getSignedInTenant } from "@aqarly/core/operations";
import Screen from "@/components/Screen";
import { Grid, Home, Mail, Phone } from "@/components/icons";

export const metadata = { title: "Profile" };

export default async function ProfilePage() {
  const tenant = await getSignedInTenant();
  const { unit, property } = tenant;

  const where = [unit && `Unit ${unit.label}`, property?.name]
    .filter(Boolean)
    .join(", ");

  return (
    <Screen title="Profile">
      <div className="mb-8 text-center">
        <Avatar name={tenant.name} size={72} className="mb-4" />
        <h2 className="text-xl font-bold text-ink">{tenant.name}</h2>
        <p className="mt-1 text-sm text-ink-soft">{where}</p>
      </div>

      <div className="flex flex-col gap-4 md:grid md:grid-cols-2 md:items-start">
        <DetailCard>
          <DetailRow icon={<Mail size={18} />} label="Email" value={tenant.email} />
          <DetailRow icon={<Phone size={18} />} label="Phone" value={tenant.phone} />
        </DetailCard>

        <DetailCard>
          <DetailRow icon={<Home size={18} />} label="Unit" value={where} />
          <DetailRow
            icon={<Grid size={18} />}
            label="Layout"
            value={
              unit ? `${unit.bedrooms} BR + ${unit.bathrooms} BA` : "Not on file"
            }
          />
        </DetailCard>
      </div>

      <div className="mt-6 flex flex-col gap-3">
        <Button variant="outline" size="lg" disabled fullWidth>
          Edit profile
        </Button>
        <Link
          href="/login"
          className="rounded-pill py-4 text-center text-base font-semibold text-danger transition-colors hover:bg-danger-tint"
        >
          Sign out
        </Link>
        <p className="text-center text-xs text-ink-muted">
          Editing a profile needs a write path, and signing out needs a session
          — neither exists yet.
        </p>
      </div>
    </Screen>
  );
}

function DetailCard({ children }) {
  return (
    <div className="rounded-md border border-border bg-surface p-2">
      <div className="divide-y divide-border">{children}</div>
    </div>
  );
}

function DetailRow({ icon, label, value }) {
  return (
    <div className="flex items-center gap-3 p-3">
      <span className="shrink-0 text-ink-soft">{icon}</span>
      <div className="min-w-0 flex-1">
        <p className="text-xs text-ink-muted">{label}</p>
        <p className="truncate text-sm font-semibold text-ink">{value}</p>
      </div>
    </div>
  );
}
