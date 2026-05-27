import Link from "next/link";
import { BookOpen, Brain, FileBadge, FlaskConical, ShieldCheck } from "lucide-react";

const highlights = [
  {
    icon: BookOpen,
    title: "Модульный трек",
    text: "От угроз и модели атаки к SOC-практике — шаг за шагом.",
  },
  {
    icon: FlaskConical,
    title: "Лаборатории в браузере",
    text: "Разбор фишинга, URL, логов и криптозадач без установки ПО.",
  },
  {
    icon: Brain,
    title: "AI-наставник",
    text: "Подсказки по теории без готовых ответов на тесты.",
  },
  {
    icon: FileBadge,
    title: "Сертификат PDF + QR",
    text: "Публичная проверка после полного прохождения программы.",
  },
] as const;

/** Компактная подсказка над формой на мобильных. */
export function AuthValueMobile() {
  return (
    <p className="mb-6 rounded-xl border border-border/80 bg-muted/30 px-4 py-3 text-center text-sm text-pretty text-muted-foreground lg:hidden">
      <span className="font-medium text-foreground">CyberEdu</span> — модульный трек, SOC-лабы в браузере и AI-наставник.
      {" "}
      <Link href="/#product" className="font-medium text-primary underline-offset-4 hover:underline">
        Подробнее
      </Link>
    </p>
  );
}

export function AuthValueAside() {
  return (
    <aside className="ce-auth-aside hidden min-w-0 flex-1 lg:block" aria-label="Почему CyberEdu">
      <div className="sticky top-24 space-y-8">
        <div className="space-y-3">
          <p className="font-mono text-2.5 font-medium uppercase tracking-wider text-primary">CyberEdu</p>
          <h2 className="font-heading text-2xl font-semibold tracking-tight text-balance text-foreground xl:text-3xl">
            Практическая академия кибербезопасности
          </h2>
          <p className="max-w-md text-pretty text-sm leading-relaxed text-muted-foreground sm:text-base">
            Не классический LMS: единая среда с лабораториями, контролем знаний и защищённой сессией.
          </p>
        </div>

        <ul className="space-y-4">
          {highlights.map(({ icon: Icon, title, text }) => (
            <li key={title} className="flex gap-3">
              <span className="mt-0.5 flex size-10 shrink-0 items-center justify-center rounded-xl border border-primary/20 bg-primary/8 text-primary">
                <Icon className="size-4" strokeWidth={1.75} aria-hidden />
              </span>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-foreground">{title}</p>
                <p className="mt-0.5 text-sm leading-relaxed text-muted-foreground">{text}</p>
              </div>
            </li>
          ))}
        </ul>

        <p className="flex items-center gap-2 text-xs text-muted-foreground">
          <ShieldCheck className="size-3.5 shrink-0 text-success" aria-hidden />
          RBAC · rate limits · аудит действий
        </p>

        <Link
          href="/#product"
          className="inline-flex text-sm font-medium text-primary underline-offset-4 hover:underline"
        >
          Узнать больше о платформе →
        </Link>
      </div>
    </aside>
  );
}
