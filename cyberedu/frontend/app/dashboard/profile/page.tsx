import type { Metadata } from "next";
import type { ReactNode } from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { GraduationCap, MapPin, School, Sparkles } from "lucide-react";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { LearnPageWrap } from "@/components/learn/learn-page-wrap";
import { ProfileProgressOverview } from "@/components/profile/profile-progress-overview";
import { Alert } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatInterestsDisplay, parseProfileInterests } from "@/lib/profile-interests";
import { getProfileCourseStats } from "@/lib/profile-course-stats";
import { getCurrentUser } from "@/lib/permissions";
import { AchievementUnlockToasts } from "@/components/achievements/achievement-unlock-toasts";
import { achievementNoticesFromKinds, getUserAchievementRows, reconcileUserAchievements } from "@/lib/achievements";

export const metadata: Metadata = {
  title: "Профиль",
};

function displayField(value: string | null | undefined) {
  const v = value?.trim();
  if (!v || v === "—") return "—";
  return v;
}

function MetaTile({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof School;
  label: string;
  value: ReactNode;
}) {
  return (
    <div className="ce-glass group relative overflow-hidden rounded-xl p-4 transition-[border-color,box-shadow] duration-200 hover:border-primary/25 hover:shadow-(--shadow-card)">
      <div className="flex items-start gap-3">
        <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary ring-1 ring-primary/15 transition-transform duration-200 group-hover:scale-105">
          <Icon className="size-5" aria-hidden />
        </span>
        <div className="min-w-0">
          <p className="typo-label">{label}</p>
          <p className="typo-body mt-1 font-medium text-foreground">{value}</p>
        </div>
      </div>
    </div>
  );
}

export default async function ProfilePage({ searchParams }: { searchParams: Promise<{ saved?: string }> }) {
  const user = await getCurrentUser();
  if (!user?.profile) {
    redirect("/auth/login");
  }

  const sp = await searchParams;
  const saved = sp.saved === "1";

  const p = user.profile;
  const newUnlocks = await reconcileUserAchievements(user.id);
  const achievementUnlocks = achievementNoticesFromKinds(newUnlocks);
  const [stats, achievements] = await Promise.all([
    getProfileCourseStats(user.id),
    getUserAchievementRows(user.id),
  ]);
  const interests = parseProfileInterests(p.interests);
  const interestsText = formatInterestsDisplay(interests);
  const hasInterestsForAi = interests.tags.length > 0 || interests.custom.trim().length > 0;

  const initialsSource = `${p.firstName}${p.lastName}`.replace(/[—\s]/g, "");
  const initials =
    initialsSource.length >= 2
      ? `${initialsSource[0] ?? ""}${initialsSource[1] ?? ""}`.toUpperCase()
      : (p.firstName?.[0] ?? "?").toUpperCase();

  const fullName = [p.lastName, p.firstName, p.middleName].filter(Boolean).join(" ").trim() || "—";

  const memberSince = new Date(user.createdAt).toLocaleDateString("ru-RU", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  return (
    <DashboardShell stack="loose">
      <LearnPageWrap>
        <AchievementUnlockToasts unlocks={achievementUnlocks} />
        {saved ? (
          <Alert variant="success" title="Профиль сохранён">
            Изменения записаны. Данные учтены для сертификата и AI-адаптации лекций.
          </Alert>
        ) : null}

        <header className="ce-user-profile-hero hero-glow ce-cyber-hero p-6 sm:p-8 lg:p-10">
          <div className="ce-user-profile-hero-blob" aria-hidden />
          <div className="ce-user-profile-hero-grid" aria-hidden />
          <div className="ce-user-profile-hero-vignette" aria-hidden />

          <div className="relative z-10 flex flex-col gap-10 lg:flex-row lg:items-start lg:justify-between">
            <div className="flex w-full flex-col items-center gap-8 sm:flex-row sm:items-start">
              <div className="relative shrink-0">
                <div className="ce-profile-avatar-ring">
                  <div className="overflow-hidden rounded-[1.22rem] bg-linear-to-br from-muted/90 to-card ring-1 ring-border/50">
                    <div className="relative flex size-28 items-center justify-center bg-linear-to-br from-primary/10 via-card to-accent/10 text-2xl font-bold tracking-tight text-primary sm:size-35 sm:text-3xl">
                      {p.avatarUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element -- внешние URL аватаров
                        <img src={p.avatarUrl} alt="" className="h-full w-full object-cover" referrerPolicy="no-referrer" />
                      ) : (
                        initials
                      )}
                    </div>
                  </div>
                </div>
                <span
                  className="pointer-events-none absolute -inset-3 -z-10 rounded-4xl bg-linear-to-br from-accent/18 via-transparent to-primary/12 opacity-90 blur-2xl"
                  aria-hidden
                />
              </div>

              <div className="min-w-0 flex-1 space-y-6 text-center sm:text-left">
                <div className="space-y-3">
                  <div className="flex flex-wrap items-center justify-center gap-2 sm:justify-start">
                    <Badge variant="secondary" className="gap-1 font-semibold ring-1 ring-border/60">
                      <Sparkles className="size-3.5 text-warning" aria-hidden />
                      Студент
                    </Badge>
                    <span className="typo-caption tabular-nums text-muted-foreground">С нами с {memberSince}</span>
                  </div>
                  <p className="typo-eyebrow text-primary">Личный профиль</p>
                  <h1 className="typo-h1 text-balance sm:text-4xl">{fullName}</h1>
                  <p className="inline-flex max-w-full items-center justify-center rounded-xl border border-border/65 bg-background/55 px-3 py-2 font-mono text-xs leading-snug text-muted-foreground shadow-inner backdrop-blur-sm sm:justify-start">
                    {user.email}
                  </p>
                </div>

                <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                  <MetaTile icon={School} label="Учебное заведение" value={displayField(p.educationalInstitution)} />
                  <MetaTile icon={GraduationCap} label="Специальность" value={displayField(p.specialty)} />
                  <MetaTile icon={MapPin} label="Город" value={displayField(p.city)} />
                </div>
              </div>
            </div>

            <div className="flex w-full max-w-md flex-col gap-3 self-stretch lg:w-72 lg:shrink-0 lg:self-start">
              <Button
                variant="primary"
                size="lg"
                className="w-full shadow-md transition-[transform,box-shadow] hover:scale-[1.01] hover:shadow-lg active:scale-[0.99] lg:w-full"
                asChild
              >
                <Link href="/dashboard/settings">Редактировать профиль</Link>
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="w-full border-primary/25 bg-card/85 backdrop-blur-sm hover:border-primary/40 lg:w-full"
                asChild
              >
                <Link href="/dashboard/settings">Настройки и пароль</Link>
              </Button>
            </div>
          </div>
        </header>

        {!stats ? (
          <div className="ce-glass rounded-2xl p-8 text-sm leading-relaxed text-muted-foreground shadow-(--shadow-card)">
            Курс в системе пока не настроен. Когда администратор подключит программу, здесь появится прогресс и сертификат.
          </div>
        ) : (
          <ProfileProgressOverview
            stats={stats}
            achievements={achievements}
            interestsDisplay={interestsText}
            hasInterestsForAi={hasInterestsForAi}
          />
        )}
      </LearnPageWrap>
    </DashboardShell>
  );
}
