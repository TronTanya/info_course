import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

const labs = [
  {
    title: "Анализ фишингового письма",
    tag: "Разбор",
    description: "Язык угроз, поддельные домены и типовые приёмы социальной инженерии.",
    border: "border-red-500/15 hover:border-red-500/25",
    chip: "bg-red-500/10 text-red-700",
  },
  {
    title: "Учебная консоль",
    tag: "Terminal",
    description: "Команды и сценарии в безопасной среде — без установки ПО на компьютер.",
    border: "border-secondary/25 hover:border-cyan/30",
    chip: "bg-secondary/10 text-secondary",
  },
  {
    title: "Криптография",
    tag: "Crypto",
    description: "Базовые идеи шифрования и проверки целостности на учебных задачах.",
    border: "border-primary/20 hover:border-primary/35",
    chip: "bg-primary/10 text-primary",
  },
  {
    title: "Анализ логов",
    tag: "Blue team",
    description: "Поиск аномалий и следов компрометации в типовых журналах событий.",
    border: "border-cyan/20 hover:border-cyan/35",
    chip: "bg-cyan/10 text-cyan",
  },
  {
    title: "Анализ URL",
    tag: "Web",
    description: "Разбор ссылок, редиректов и признаков опасных ресурсов.",
    border: "border-amber-500/20 hover:border-amber-500/35",
    chip: "bg-amber-500/10 text-amber-900",
  },
];

export function LandingPracticeShowcase() {
  return (
    <section className="space-y-10" aria-labelledby="practice-heading">
      <div className="mx-auto max-w-3xl text-center">
        <p className="text-xs font-semibold uppercase tracking-widest text-primary">Практика</p>
        <h2 id="practice-heading" className="mt-3 text-balance text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
          Лаборатории, которые ощущаются «по-настоящему»
        </h2>
        <p className="mt-4 text-pretty text-base text-muted-foreground sm:text-lg">
          Разные форматы заданий — от текста до интерактива. Часть проверяется автоматически, часть — преподавателем.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {labs.map((lab) => (
          <Card
            key={lab.title}
            className={cn(
              "group border bg-card/95 shadow-card transition-all duration-300",
              "hover:-translate-y-0.5 hover:shadow-[var(--shadow-card-hover)]",
              lab.border,
            )}
          >
            <CardHeader className="pb-2">
              <div className="mb-2 flex items-center justify-between gap-2">
                <span className={cn("rounded-lg px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide", lab.chip)}>
                  {lab.tag}
                </span>
                <span className="font-mono text-[10px] text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100">
                  →
                </span>
              </div>
              <CardTitle className="text-lg leading-snug">{lab.title}</CardTitle>
              <CardDescription className="text-sm leading-relaxed">{lab.description}</CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="h-px w-full bg-gradient-to-r from-transparent via-border to-transparent" />
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}
