import { Card, CardContent } from "@/components/ui/card";

const features = [
  {
    title: "Объяснить проще",
    body: "Сложный абзац превращается в короткую версию с аналогиями — когда терминология мешает сфокусироваться.",
  },
  {
    title: "Объяснить через мои интересы",
    body: "Примеры подстраиваются под ваш профиль: медицина, бизнес, геймдев — чтобы связь с темой была наглядной.",
  },
  {
    title: "Наставник вместо готовых ответов",
    body: "Вопросы и подсказки в духе сократического диалога: вы думаете, AI направляет — без «списать решение в один клик».",
  },
];

export function LandingAiFeatures() {
  return (
    <section
      className="relative overflow-hidden rounded-3xl border border-border/80 bg-linear-to-br from-card via-muted/20 to-cyan/[0.04] px-6 py-14 shadow-card sm:px-10 sm:py-16"
      aria-labelledby="ai-heading"
    >
      <div className="pointer-events-none absolute -right-24 top-0 h-64 w-64 rounded-full bg-cyan/10 blur-3xl" aria-hidden />
      <div className="pointer-events-none absolute -bottom-20 -left-16 h-56 w-56 rounded-full bg-primary/8 blur-3xl" aria-hidden />

      <div className="relative mx-auto max-w-3xl text-center">
        <p className="text-xs font-semibold uppercase tracking-widest text-cyan">Искусственный интеллект</p>
        <h2 id="ai-heading" className="mt-3 text-balance text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
          AI-функции в сервисе обучения, а не вместо него
        </h2>
        <p className="mt-4 text-pretty text-base text-muted-foreground sm:text-lg">
          Помощник встроен в лекции и практику: ускоряет понимание, но не подменяет вашу работу на заданиях.
        </p>
      </div>

      <div className="relative mt-10 grid gap-5 md:grid-cols-3">
        {features.map((f) => (
          <Card
            key={f.title}
            className="border-border/80 bg-card/90 shadow-sm backdrop-blur-sm transition-all duration-300 hover:border-primary/20 hover:shadow-[var(--shadow-card-hover)]"
          >
            <CardContent className="space-y-3 p-6">
              <div className="flex size-10 items-center justify-center rounded-xl bg-linear-to-br from-primary/15 to-cyan/10 font-mono text-xs font-bold text-primary">
                AI
              </div>
              <h3 className="text-lg font-semibold text-foreground">{f.title}</h3>
              <p className="text-sm leading-relaxed text-muted-foreground">{f.body}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}
