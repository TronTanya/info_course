import { FlaskConical } from "lucide-react";
import { SectionCard } from "@/components/ui/section-card";

export function LessonPracticeExample({ title, body }: { title: string; body: string }) {
  return (
    <section id="lesson-practice-example" className="scroll-mt-28" aria-labelledby="lesson-practice-heading">
      <SectionCard variant="lab" flushTitle className="p-5 sm:p-6">
        <div className="flex gap-3">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-xl border border-primary/25 bg-primary/10 text-primary">
            <FlaskConical className="size-5" strokeWidth={1.75} aria-hidden />
          </span>
          <div className="min-w-0 flex-1">
            <h2 id="lesson-practice-heading" className="font-display text-lg font-semibold text-foreground">
              Пример из практики
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Связь теории с тем, что встретится в лаборатории — без готовых ответов на задания.
            </p>
            <h3 className="mt-4 text-base font-semibold text-foreground">{title}</h3>
            <p className="mt-2 whitespace-pre-wrap text-[15px] leading-relaxed text-foreground/90">{body}</p>
          </div>
        </div>
      </SectionCard>
    </section>
  );
}
