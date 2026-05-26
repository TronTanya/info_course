import type { ProfileSkillArea } from "@/lib/profile-portfolio";
import { ProgressBar } from "@/components/ui/progress-bar";
import { SectionCard } from "@/components/ui/section-card";
import { EmptyState } from "@/components/ui/empty-state";
import { cn } from "@/lib/utils";

const statusLabel: Record<ProfileSkillArea["status"], string> = {
  not_started: "Не начато",
  in_progress: "В процессе",
  strong: "Уверенно",
};

export function ProfileSkillsMap({ skills }: { skills: ProfileSkillArea[] }) {
  const hasAny = skills.some((s) => s.matchedModules > 0);

  return (
    <SectionCard variant="lab" flushTitle className="p-4 sm:p-6" aria-labelledby="profile-skills-heading">
      <h2 id="profile-skills-heading" className="font-display text-base font-semibold text-foreground sm:text-lg">
        Карта навыков
      </h2>
      <p className="mt-1 text-sm text-muted-foreground">
        Прогресс по тематическим областям курса — без раскрытия ответов на практику.
      </p>

      {!hasAny ? (
        <EmptyState
          className="mt-4 py-8"
          title="Навыки появятся с модулями"
          description="Когда программа курса будет доступна, здесь отобразится прогресс по направлениям."
        />
      ) : (
        <ul className="mt-5 grid gap-3 sm:grid-cols-2">
          {skills.map((skill) => (
            <li
              key={skill.id}
              className={cn(
                "rounded-xl border border-border/70 bg-muted/15 px-3 py-3",
                skill.status === "strong" && "border-success/30 bg-success/5",
              )}
            >
              <div className="flex items-center justify-between gap-2">
                <span className="text-sm font-medium text-foreground">{skill.label}</span>
                <span className="text-2.5 font-semibold uppercase tracking-wide text-muted-foreground">
                  {statusLabel[skill.status]}
                </span>
              </div>
              <ProgressBar
                className="mt-2"
                label={`Прогресс: ${skill.label}`}
                value={skill.percent}
                max={100}
                tone={skill.status === "strong" ? "success" : skill.percent > 0 ? "default" : "default"}
              />
              {skill.matchedModules > 0 ? (
                <p className="mt-1.5 text-2.75 text-muted-foreground">
                  Модулей в области: {skill.completedModules}/{skill.matchedModules}
                </p>
              ) : null}
            </li>
          ))}
        </ul>
      )}
    </SectionCard>
  );
}
