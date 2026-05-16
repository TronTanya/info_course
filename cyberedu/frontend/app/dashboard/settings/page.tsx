import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { UserSettingsForm } from "@/components/settings/user-settings-form";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/ui/page-header";
import { toDateInputValue } from "@/lib/profile-dates";
import { parseProfileInterests } from "@/lib/profile-interests";
import { getCurrentUser } from "@/lib/permissions";

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
      <div className="space-y-8 pb-8">
        <PageHeader
          title="Настройки"
          description="Личные данные, аватар, интересы для AI и сведения об аккаунте — в одном месте, с сохранением в ваш профиль."
          actions={
            <Button variant="outline" size="sm" className="w-full border-primary/25 bg-card/80 sm:w-auto" asChild>
              <Link href="/dashboard/profile">← К профилю</Link>
            </Button>
          }
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
      </div>
    </DashboardShell>
  );
}
