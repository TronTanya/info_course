import type { CourseProgressModuleRow } from "@/lib/progress";
import { getModuleEntityStatus } from "@/lib/course-ui-status";
import { CourseModuleCard } from "@/components/course/course-module-card";
import { cn } from "@/lib/utils";

export function CourseRoadmapModuleCards({
  modules,
  focusModuleId,
  className,
}: {
  modules: CourseProgressModuleRow[];
  focusModuleId?: string | null;
  className?: string;
}) {
  if (modules.length === 0) return null;

  const nextId =
    (focusModuleId && modules.find((m) => m.module.id === focusModuleId)?.module.id) ??
    modules.find((m) => getModuleEntityStatus(m) === "in_progress")?.module.id ??
    modules.find((m) => m.unlocked && !m.moduleCompleted)?.module.id ??
    null;

  return (
    <section className={cn("ce-course-module-cards min-w-0 max-w-full", className)} aria-labelledby="course-module-cards-heading">
      <div className="mb-6 flex flex-col gap-2 sm:mb-8">
        <p className="typo-eyebrow text-primary">Модули программы</p>
        <h2 id="course-module-cards-heading" className="font-display text-xl font-semibold text-foreground sm:text-2xl">
          Карточки модулей
        </h2>
        <p className="max-w-2xl text-sm text-pretty text-muted-foreground">
          Подробности по каждому блоку: навык, сложность, состав и действие для продолжения.
        </p>
      </div>

      <ul
        className="grid list-none gap-4 p-0 sm:gap-5 md:grid-cols-2 xl:grid-cols-3"
        aria-label="Карточки модулей программы"
      >
        {modules.map((row, index) => (
          <li key={row.module.id} className="min-w-0">
            <CourseModuleCard
              row={row}
              modules={modules}
              isNext={Boolean(nextId && row.module.id === nextId)}
              index={index}
            />
          </li>
        ))}
      </ul>
    </section>
  );
}
