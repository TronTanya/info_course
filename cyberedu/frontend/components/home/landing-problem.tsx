import { Card, CardContent } from "@/components/ui/card";

const threats = [
  {
    title: "Фишинг",
    description: "Поддельные письма и сайты крадут пароли и данные карт, пока вы не заметите подмену.",
    accent: "from-red-500/12 to-transparent",
  },
  {
    title: "Слабые пароли",
    description: "Повторы, даты рождения и «qwerty» — главный подарок для автоматического взлома.",
    accent: "from-amber-500/12 to-transparent",
  },
  {
    title: "Утечки данных",
    description: "Одна скомпрометированная учётная запись может открыть доступ к почте, облаку и рабочим системам.",
    accent: "from-primary/14 to-transparent",
  },
  {
    title: "Небезопасные устройства",
    description: "Устаревшие обновления, публичный Wi‑Fi и чужие USB — типовые точки входа для вредоносного ПО.",
    accent: "from-cyan/14 to-transparent",
  },
  {
    title: "Ошибки в интернете",
    description: "Случайный клик, скачивание файла без проверки, избыточные права доступа — человеческий фактор в цифрах.",
    accent: "from-secondary/18 to-transparent",
  },
];

export function LandingProblem() {
  return (
    <section className="space-y-10" aria-labelledby="problem-heading">
      <div className="mx-auto max-w-3xl text-center">
        <p className="text-xs font-semibold uppercase tracking-widest text-primary">Почему это важно</p>
        <h2 id="problem-heading" className="mt-3 text-balance text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
          Информационная безопасность — не «для айтишников», а базовая гигиена цифровой жизни
        </h2>
        <p className="mt-4 text-pretty text-base leading-relaxed text-muted-foreground sm:text-lg">
          Курс помогает увидеть реальные сценарии угроз и научиться простым привычкам, которые снижают риски каждый день.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {threats.map((t, i) => (
          <Card
            key={t.title}
            className="group relative overflow-hidden border-border/80 bg-card/95 shadow-card transition-all duration-300 hover:-translate-y-0.5 hover:border-primary/20 hover:shadow-[var(--shadow-card-hover)]"
          >
            <div
              className={`pointer-events-none absolute inset-0 bg-gradient-to-br opacity-100 ${t.accent}`}
              aria-hidden
            />
            <CardContent className="relative space-y-2 p-6">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-border/80 bg-card/90 font-mono text-xs font-bold text-primary">
                {String(i + 1).padStart(2, "0")}
              </div>
              <h3 className="text-lg font-semibold text-foreground">{t.title}</h3>
              <p className="text-sm leading-relaxed text-muted-foreground">{t.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}
