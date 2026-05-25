import Link from "next/link";
import { GraduationCap, MapPin, School, Sparkles, Trophy } from "lucide-react";
import { ProfileAchievementsPanel } from "@/components/achievements/profile-achievements-panel";
import { ProfileCompletedModules } from "@/components/profile/profile-completed-modules";
import { ProfileMetaTile } from "@/components/profile/profile-meta-tile";
import { ProfileUserStatsStrip } from "@/components/profile/profile-user-stats-strip";
import type { PublicStudentProfile } from "@/lib/public-student-profile";
import { buildProfileLearningStatus, profileRoleLabel } from "@/lib/profile-portfolio";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ProgressBar } from "@/components/ui/progress-bar";
import { ProgressRing } from "@/components/ui/progress-ring";
import { SectionCard } from "@/components/ui/section-card";

function displayField(value: string | null | undefined) {
  const v = value?.trim();
  if (!v || v === "—") return "—";
  return v;
}

export function PublicStudentProfileView({ profile }: { profile: PublicStudentProfile }) {
  const { stats, achievements, achievementsUnlocked, isSelf } = profile;
  const learningStatus = buildProfileLearningStatus(stats);
  const progressTone = stats.progressPercent >= 100 ? "success" : "default";
  const firstName = profile.fullName.split(/\s+/).filter(Boolean).pop() ?? profile.fullName;

  return (
    <div className="min-w-0 space-y-5 sm:space-y-6">
      <header className="ce-profile-user-card ce-user-profile-hero hero-glow ce-cyber-hero overflow-x-clip p-4 sm:p-8">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-start">
          <div className="relative shrink-0 mx-auto sm:mx-0">
            <div className="ce-profile-avatar-ring">
              <div className="flex size-24 items-center justify-center overflow-hidden rounded-[1.1rem] bg-linear-to-br from-primary/10 to-card text-xl font-bold text-primary sm:size-28">
                {profile.avatarUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={profile.avatarUrl}
                    alt=""
                    className="size-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  profile.initials
                )}
              </div>
            </div>
          </div>
          <div className="min-w-0 flex-1 space-y-4 text-center sm:text-left">
            <div>
              <p className="typo-eyebrow text-primary">Профиль студента</p>
              <div className="mt-2 flex flex-wrap items-center justify-center gap-2 sm:justify-start">
                <Badge variant="secondary" className="gap-1 font-semibold">
                  <Sparkles className="size-3.5 text-warning" aria-hidden />
                  {profileRoleLabel(profile.role)}
                </Badge>
                <span className="typo-caption text-muted-foreground">с {profile.memberSince}</span>
              </div>
              <h1 className="typo-h1 mt-2 text-balance">{profile.fullName}</h1>
              <p className="mt-2 text-sm font-medium text-foreground/90">{learningStatus}</p>
            </div>
            <div className="ce-profile-meta-grid grid grid-cols-1 gap-2 sm:grid-cols-2 sm:gap-3">
              <ProfileMetaTile
                wide
                icon={School}
                label="Учебное заведение"
                value={displayField(profile.educationalInstitution)}
              />
              <ProfileMetaTile icon={GraduationCap} label="Специальность" value={displayField(profile.specialty)} />
              <ProfileMetaTile icon={MapPin} label="Город" value={displayField(profile.city)} />
            </div>
            <ProfileUserStatsStrip
              stats={stats}
              achievementsUnlocked={achievementsUnlocked}
              achievementsTotal={achievements.length}
            />
            {isSelf ? (
              <Button variant="outline" size="sm" asChild className="mt-2">
                <Link href="/dashboard/profile">Мой профиль и настройки</Link>
              </Button>
            ) : null}
          </div>
        </div>
      </header>

      <SectionCard variant="lab" flushTitle className="p-5 sm:p-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="typo-eyebrow text-primary">Текущий модуль</p>
            <h2 className="mt-1 font-display text-lg font-semibold text-foreground sm:text-xl">
              {stats.currentModuleTitle ?? "Программа не начата"}
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              {stats.courseTitle} · {stats.completedModules} из {stats.totalModules} модулей · {stats.totalPoints}{" "}
              баллов
            </p>
          </div>
          <Badge variant={stats.allModulesComplete ? "success" : "secondary"} className="shrink-0 gap-1">
            <Trophy className="size-3.5" aria-hidden />
            {stats.progressPercent}%
          </Badge>
        </div>
        <div className="mt-6 flex flex-col gap-6 sm:flex-row sm:items-center">
          <ProgressRing value={stats.progressPercent} size={100} strokeWidth={8} tone={progressTone} label="Курс" />
          <div className="min-w-0 flex-1">
            <ProgressBar label="Прогресс по модулям" value={stats.progressPercent} max={100} tone={progressTone} />
          </div>
        </div>
      </SectionCard>

      {stats.completedModuleRows.length > 0 ? (
        <ProfileCompletedModules modules={stats.completedModuleRows} />
      ) : null}

      <SectionCard variant="default" flushTitle>
        <ProfileAchievementsPanel
          rows={achievements}
          viewer="other"
          studentFirstName={firstName}
          showCourseLink={false}
        />
      </SectionCard>
    </div>
  );
}
