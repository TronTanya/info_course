import type { LessonSelfCheckItem } from "@/lib/lesson-page-ui";
import { LessonKeyIdeas } from "@/components/lesson/lesson-key-ideas";
import { LessonRememberBlock } from "@/components/lesson/lesson-remember-block";
import { LessonPracticeExample } from "@/components/lesson/lesson-practice-example";
import { LessonSelfCheck } from "@/components/lesson/lesson-self-check";
import { cn } from "@/lib/utils";

export type LessonLearningBlocksProps = {
  keyIdeas: string[];
  remember: { title: string; items: string[] } | null;
  practice: { title: string; body: string } | null;
  selfCheck: LessonSelfCheckItem[];
  className?: string;
};

const NAV_ITEMS = [
  { id: "lesson-key-ideas", label: "Идеи" },
  { id: "lesson-remember", label: "Запомнить" },
  { id: "lesson-practice-example", label: "Практика" },
  { id: "lesson-self-check", label: "Проверка" },
] as const;

export function LessonLearningBlocks({
  keyIdeas,
  remember,
  practice,
  selfCheck,
  className,
}: LessonLearningBlocksProps) {
  const hasRemember = remember && remember.items.length > 0;
  const hasPractice = Boolean(practice);
  const hasKeyIdeas = keyIdeas.length > 0;
  const hasSelfCheck = selfCheck.length > 0;

  if (!hasRemember && !hasPractice && !hasKeyIdeas && !hasSelfCheck) return null;

  const visibleNav = NAV_ITEMS.filter((item) => {
    if (item.id === "lesson-key-ideas") return hasKeyIdeas;
    if (item.id === "lesson-remember") return hasRemember;
    if (item.id === "lesson-practice-example") return hasPractice;
    if (item.id === "lesson-self-check") return hasSelfCheck;
    return false;
  });

  return (
    <section
      className={cn("space-y-6 border-t border-border/60 pt-10", className)}
      aria-label="Блоки для закрепления"
    >
      {visibleNav.length > 1 ? (
        <nav aria-label="Разделы закрепления" className="flex flex-wrap gap-2">
          {visibleNav.map((item) => (
            <a
              key={item.id}
              href={`#${item.id}`}
              className="rounded-full border border-border/80 bg-muted/20 px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:border-primary/30 hover:text-foreground focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring"
            >
              {item.label}
            </a>
          ))}
        </nav>
      ) : null}

      {hasRemember && remember ? <LessonRememberBlock title={remember.title} items={remember.items} /> : null}
      {hasKeyIdeas ? (
        <div id="lesson-key-ideas" className="scroll-mt-28">
          <LessonKeyIdeas ideas={keyIdeas} />
        </div>
      ) : null}
      {hasPractice && practice ? <LessonPracticeExample title={practice.title} body={practice.body} /> : null}
      {hasSelfCheck ? (
        <div id="lesson-self-check" className="scroll-mt-28">
          <LessonSelfCheck items={selfCheck} />
        </div>
      ) : null}
    </section>
  );
}
