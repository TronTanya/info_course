import { Bookmark } from "lucide-react";
import { LearningCallout } from "@/components/learn/learning-callout";

export function LessonRememberBlock({ title, items }: { title: string; items: string[] }) {
  if (items.length === 0) return null;

  return (
    <section id="lesson-remember" className="scroll-mt-28">
      <LearningCallout variant="success" title={title} label="Важно запомнить">
        <ul className="mt-1 space-y-2 text-base leading-relaxed">
          {items.map((item, i) => (
            <li key={i} className="flex gap-2.5 text-pretty">
              <Bookmark className="mt-1 size-3.5 shrink-0 opacity-80" aria-hidden />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </LearningCallout>
    </section>
  );
}
