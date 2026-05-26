import { LandingSection } from "@/components/home/landing-section";
import { cn } from "@/lib/utils";

const faq = [
  {
    q: "Нужен ли опыт в IT или информационной безопасности?",
    a: "Нет. Курс рассчитан на осознанный старт: от базовых угроз к практике. Термины объясняются по ходу, без лишнего жаргона.",
  },
  {
    q: "Сколько стоит обучение?",
    a: "Регистрация бесплатна. Доступ к материалам и прогрессу — в личном кабинете после создания аккаунта.",
  },
  {
    q: "Как устроена практика?",
    a: "В модулях есть лаборатории: разбор писем, URL, логов, криптозадачи и другие форматы. Часть проверяется автоматически, часть — преподавателем.",
  },
  {
    q: "Что делает AI-наставник?",
    a: "Помогает понять лекции и адаптирует примеры под ваши интересы. Не выдаёт готовые ответы на тесты и практические задания.",
  },
  {
    q: "Когда выдаётся сертификат?",
    a: "После завершения всех активных модулей курса. Документ можно скачать в PDF; номер проверяется на сайте.",
  },
  {
    q: "Можно ли учиться с телефона?",
    a: "Да, интерфейс адаптирован под мобильные экраны. Для части лабораторий удобнее ноутбук — это указано в задании.",
  },
  {
    q: "Подходит ли платформа для учебной группы?",
    a: "Да. Есть админ-панель для преподавателя: пользователи, проверка работ, контент модулей и выгрузка отчётов.",
  },
] as const;

export function LandingFaq() {
  return (
    <LandingSection
      id="faq"
      eyebrow="Вопросы и ответы"
      title="Частые вопросы"
      description="Коротко о формате, стоимости и сертификате."
    >
      <div className="mx-auto max-w-3xl space-y-3">
        {faq.map((item) => (
          <details
            key={item.q}
            className={cn(
              "ce-glass ce-surface-interactive group rounded-2xl",
              "open:border-primary/25 open:shadow-card-hover",
            )}
          >
            <summary className="cursor-pointer list-none px-5 py-4 text-sm font-semibold text-foreground marker:content-none [&::-webkit-details-marker]:hidden">
              <span className="flex items-center justify-between gap-4">
                {item.q}
                <span
                  className="flex size-8 shrink-0 items-center justify-center rounded-lg border border-border/80 bg-card/80 text-primary transition-transform group-open:rotate-45"
                  aria-hidden
                >
                  +
                </span>
              </span>
            </summary>
            <div className="border-t border-border/50 px-5 pb-4 pt-0">
              <p className="pt-3 text-sm leading-relaxed text-muted-foreground">{item.a}</p>
            </div>
          </details>
        ))}
      </div>
    </LandingSection>
  );
}
