import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AdminProfileView } from "@/components/admin/admin-profile-view";
import { AdminShell } from "@/components/layout/admin-shell";
import { getCurrentUser } from "@/lib/permissions";

export const metadata: Metadata = {
  title: "Админка · Профиль",
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
  const user = await getCurrentUser();
  if (!user) {
    redirect("/auth/login");
  }
  if (user.role !== "ADMIN") {
    redirect("/");
  }

  const p = user.profile;
  const fullName =
    p != null
      ? [p.lastName, p.firstName, p.middleName].filter(Boolean).join(" ").trim() || null
      : null;
  const displayName = fullName && fullName.length > 0 ? fullName : "Администратор";
  const initials = p
    ? buildInitials(p.firstName, p.lastName, user.email)
    : buildInitials(null, null, user.email);

  const institution = p?.educationalInstitution?.trim() || null;
  const subtitle =
    institution ??
    "Полный доступ к модерации контента, пользователям и отчётам. Пароль и хеш не отображаются в интерфейсе.";

  const memberSinceLabel = `В системе с ${new Date(user.createdAt).toLocaleDateString("ru-RU", {
    day: "numeric",
    month: "short",
    year: "numeric",
  })}`;

  return (
    <AdminShell>
      <AdminProfileView
        email={user.email}
        displayName={displayName}
        initials={initials}
        avatarUrl={p?.avatarUrl?.trim() || null}
        subtitle={subtitle}
        memberSinceLabel={memberSinceLabel}
      />
    </AdminShell>
  );
}
