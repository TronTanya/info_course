import { BookOpen, Brain, ClipboardCheck, FileBadge, FlaskConical } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const items = [
  {
    icon: BookOpen,
    title: "Лекции человеческим языком",
    description: "Структурированный текст и видео: от идей к действиям, без лишнего жаргона.",
  },
  {
    icon: ClipboardCheck,
    title: "Тесты среднего уровня",
    description: "Проверка понимания после блоков — достаточно строго, чтобы закрепить материал.",
  },
  {
    icon: FlaskConical,
    title: "Практические лаборатории",
    description: "Разбор кейсов, файлы, консоль и сценарии, приближенные к реальным задачам.",
  },
  {
    icon: Brain,
    title: "AI-адаптация материала",
    description: "Пояснения и примеры с учётом ваших интересов из профиля — без списывания за вас.",
  },
  {
    icon: FileBadge,
    title: "Сертификат",
    description: "Итоговый документ по завершении программы — для портфолио и самопрезентации.",
  },
];

export function LandingCourseInside() {
  return (
    <section id="program" className="scroll-mt-24 space-y-10" aria-labelledby="program-heading">
      <div className="mx-auto max-w-3xl text-center">
        <p className="text-xs font-semibold uppercase tracking-widest text-cyan">Программа</p>
        <h2 id="program-heading" className="mt-3 text-balance text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
          Что внутри курса
        </h2>
        <p className="mt-4 text-pretty text-base leading-relaxed text-muted-foreground sm:text-lg">
          Один поток: теория → проверка → практика → следующий модуль. Всё в одном интерфейсе.
        </p>
      </div>

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((item) => (
          <Card
            key={item.title}
            className="group border-border/80 bg-card/95 shadow-card transition-all duration-300 hover:-translate-y-0.5 hover:border-cyan/25 hover:shadow-[var(--shadow-card-hover)]"
          >
            <CardHeader className="pb-2">
              <div className="mb-3 flex size-11 items-center justify-center rounded-xl border border-primary/15 bg-primary/8 text-primary transition-colors group-hover:bg-primary/12">
                <item.icon className="size-5" strokeWidth={1.75} aria-hidden />
              </div>
              <CardTitle className="text-lg leading-snug">{item.title}</CardTitle>
              <CardDescription className="text-sm leading-relaxed">{item.description}</CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="h-1 w-10 rounded-full bg-gradient-to-r from-primary to-cyan opacity-90 transition-all group-hover:w-16" />
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}
