import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { LearnPageHeader, LearnPageShell } from "@/components/learn/learn-chrome";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { UserSettingsForm } from "@/components/settings/user-settings-form";
import { Alert } from "@/components/ui/alert";
import { toDateInputValue } from "@/lib/profile-dates";
import { parseProfileInterests } from "@/lib/profile-interests";
import { getCurrentUser } from "@/lib/permissions";
import { dashboardSectionBreadcrumbs } from "@/lib/student-nav";

export const metadata: Metadata = {
  title: "Настройки",
};

function dashToEmpty(s: string) {
  return s.trim() === "—" ? "" : s;
}

export default async function DashboardSettingsPage({
  searchParams,
}: {
  searchParams: Promise<{ saved?: string }>;
}) {
  const user = await getCurrentUser();
  if (!user?.profile) {
    redirect("/auth/login");
  }

  const sp = await searchParams;
  const saved = sp.saved === "1";

  const p = user.profile;
  const interests = parseProfileInterests(p.interests);
  const formKey = p.updatedAt.toISOString();

  return (
    <DashboardShell>
      <LearnPageShell className="space-y-8 pb-8">
        <LearnPageHeader
          backHref="/dashboard/profile"
          backLabel="← Профиль"
          breadcrumbItems={dashboardSectionBreadcrumbs("Настройки")}
          eyebrow="Аккаунт"
          title="Настройки"
          subtitle="Личные данные, аватар, интересы для AI и сведения об аккаунте."
        />

        {saved ? (
          <Alert variant="success" title="Изменения сохранены">
            Данные записаны в профиль и будут использоваться в курсе, сертификате и AI-персонализации.
          </Alert>
        ) : null}

        <UserSettingsForm
          key={formKey}
          email={user.email}
          defaults={{
            lastName: dashToEmpty(p.lastName),
            firstName: dashToEmpty(p.firstName),
            middleName: p.middleName ?? "",
            birthDate: toDateInputValue(p.birthDate),
            educationalInstitution: dashToEmpty(p.educationalInstitution),
            city: dashToEmpty(p.city),
            specialty: dashToEmpty(p.specialty),
            avatarUrl: p.avatarUrl,
            selectedTags: interests.tags,
            customInterest: interests.custom,
          }}
        />
      </LearnPageShell>
    </DashboardShell>
  );
}
