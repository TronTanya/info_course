import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AdminProfileHero } from "@/components/admin/admin-profile-hero";
import { AdminSecurityDashboard } from "@/components/admin/admin-security-dashboard";
import { AdminShell } from "@/components/layout/admin-shell";
import { assertAdminDataAccess } from "@/lib/admin-access";
import { getAdminSecurityDashboardData } from "@/lib/admin-security-dashboard";
import { getAdminUserListRows } from "@/lib/admin-users-list";
import { getCurrentUser } from "@/lib/permissions";

export const metadata: Metadata = {
  title: "Админка · Security Dashboard",
};

function buildInitials(first: string | null, last: string | null, email: string) {
  const a = (last?.trim()?.[0] ?? "").toUpperCase();
  const b = (first?.trim()?.[0] ?? "").toUpperCase();
  if (a && b) return `${a}${b}`;
  if (a) return `${a}${a}`;
  const e = email.trim();
  if (e.length >= 2) return e.slice(0, 2).toUpperCase();
  return "A";
}

export default async function AdminProfilePage() {
  const session = await assertAdminDataAccess();
  const user = await getCurrentUser();
  if (!user) redirect("/auth/login?callbackUrl=%2Fadmin");
  if (user.id !== session.user.id) redirect("/auth/login?callbackUrl=%2Fadmin");

  const [dashboard, users] = await Promise.all([getAdminSecurityDashboardData(), getAdminUserListRows()]);

  const p = user.profile;
  const fullName =
    p != null ? [p.lastName, p.firstName, p.middleName].filter(Boolean).join(" ").trim() || null : null;
  const displayName = fullName && fullName.length > 0 ? fullName : "Администратор";
  const initials = p ? buildInitials(p.firstName, p.lastName, user.email) : buildInitials(null, null, user.email);

  const memberSinceLabel = `В системе с ${new Date(user.createdAt).toLocaleDateString("ru-RU", {
    day: "numeric",
    month: "short",
    year: "numeric",
  })}`;

  return (
    <AdminShell>
      <div className="space-y-8">
        <AdminProfileHero
          email={user.email}
          displayName={displayName}
          initials={initials}
          avatarUrl={p?.avatarUrl?.trim() || null}
          memberSinceLabel={memberSinceLabel}
          appStatus={dashboard.system.appStatus}
        />
        <AdminSecurityDashboard data={dashboard} users={users} />
      </div>
    </AdminShell>
  );
}
