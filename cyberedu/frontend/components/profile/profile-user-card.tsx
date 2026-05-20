import Link from "next/link";
import type { Role } from "@prisma/client";
import { GraduationCap, MapPin, Pencil, School, Sparkles } from "lucide-react";
import type { ProfileCourseStats } from "@/lib/profile-course-stats";
import { buildProfileLearningStatus, profileRoleLabel } from "@/lib/profile-portfolio";
import { ProfileUserStatsStrip } from "@/components/profile/profile-user-stats-strip";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

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
  value: string;
}) {
  return (
    <div className="ce-glass rounded-xl border border-border/60 p-3 sm:p-4">
      <div className="flex items-start gap-3">
        <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary ring-1 ring-primary/15">
          <Icon className="size-4" aria-hidden />
        </span>
        <div className="min-w-0">
          <p className="typo-label">{label}</p>
          <p className="typo-body mt-0.5 font-medium text-foreground">{value}</p>
        </div>
      </div>
    </div>
  );
}

export function ProfileUserCard({
  fullName,
  email,
  role,
  memberSince,
  learningStartedAt,
  avatarUrl,
  initials,
  educationalInstitution,
  specialty,
  city,
  stats,
  achievementsUnlocked,
  achievementsTotal,
}: {
  fullName: string;
  email: string;
  role: Role;
  memberSince: string;
  learningStartedAt: string;
  avatarUrl: string | null;
  initials: string;
  educationalInstitution: string | null | undefined;
  specialty: string | null | undefined;
  city: string | null | undefined;
  stats: ProfileCourseStats | null;
  achievementsUnlocked: number;
  achievementsTotal: number;
}) {
  const learningStatus = stats ? buildProfileLearningStatus(stats) : "Программа курса ещё не подключена";

  return (
    <header className="ce-profile-user-card ce-user-profile-hero hero-glow ce-cyber-hero overflow-x-clip p-4 sm:p-8 lg:p-10">
      <div className="ce-user-profile-hero-blob" aria-hidden />
      <div className="ce-user-profile-hero-grid" aria-hidden />
      <div className="ce-user-profile-hero-vignette" aria-hidden />

      <div className="relative z-10 flex flex-col gap-8 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex w-full flex-col items-center gap-6 sm:flex-row sm:items-start">
          <div className="relative shrink-0">
            <div className="ce-profile-avatar-ring">
              <div className="overflow-hidden rounded-[1.22rem] bg-linear-to-br from-muted/90 to-card ring-1 ring-border/50">
                <div className="relative flex size-28 items-center justify-center bg-linear-to-br from-primary/10 via-card to-accent/10 text-2xl font-bold tracking-tight text-primary sm:size-32 sm:text-3xl">
                  {avatarUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element -- внешние URL аватаров
                    <img
                      src={avatarUrl}
                      alt={fullName !== "—" ? `Фото профиля: ${fullName}` : "Фото профиля"}
                      className="h-full w-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    initials
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="min-w-0 flex-1 space-y-5 text-center sm:text-left">
            <div className="space-y-2">
              <p className="typo-eyebrow text-primary">Progress portfolio</p>
              <div className="flex flex-wrap items-center justify-center gap-2 sm:justify-start">
                <Badge variant="secondary" className="gap-1 font-semibold ring-1 ring-border/60">
                  <Sparkles className="size-3.5 text-warning" aria-hidden />
                  {profileRoleLabel(role)}
                </Badge>
                <span className="typo-caption text-muted-foreground">Аккаунт с {memberSince}</span>
              </div>
              <h1 className="typo-h1 text-balance sm:text-4xl">{fullName}</h1>
              <p className="inline-flex max-w-full items-center justify-center rounded-xl border border-border/65 bg-background/55 px-3 py-2 font-mono text-xs text-muted-foreground sm:justify-start">
                {email}
              </p>
              <p className="text-sm font-medium text-foreground/90">{learningStatus}</p>
              <p className="text-xs text-muted-foreground">Обучение с {learningStartedAt}</p>
            </div>

            <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
              <MetaTile icon={School} label="Учебное заведение" value={displayField(educationalInstitution)} />
              <MetaTile icon={GraduationCap} label="Специальность" value={displayField(specialty)} />
              <MetaTile icon={MapPin} label="Город" value={displayField(city)} />
            </div>

            {stats ? (
              <ProfileUserStatsStrip
                stats={stats}
                achievementsUnlocked={achievementsUnlocked}
                achievementsTotal={achievementsTotal}
              />
            ) : null}
          </div>
        </div>

        <div className="flex w-full flex-col gap-2 lg:w-56 lg:shrink-0">
          <Button variant="primary" size="lg" className="w-full" asChild>
            <Link href="/dashboard/settings">
              <Pencil className="size-4" aria-hidden />
              Редактировать профиль
            </Link>
          </Button>
          {stats ? (
            <Button variant="outline" size="lg" className="w-full border-primary/25" asChild>
              <Link href="/dashboard/course">К карте курса</Link>
            </Button>
          ) : null}
        </div>
      </div>
    </header>
  );
}
