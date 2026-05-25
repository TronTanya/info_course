import Link from "next/link";
import {
  Activity,
  Bot,
  Cookie,
  FileCheck,
  Lock,
  Shield,
  ShieldCheck,
  Upload,
  Users,
} from "lucide-react";
import { SectionCard } from "@/components/ui/section-card";

const CONTROLS = [
  {
    icon: Users,
    title: "RBAC и защита маршрутов",
    description:
      "Роли USER и ADMIN. Middleware, layout и server actions дублируют проверки для /dashboard и /admin. Чужие submission, PDF и экспорт недоступны без прав.",
  },
  {
    icon: Lock,
    title: "Сессии и CSRF",
    description:
      "NextAuth JWT, bcrypt, hardened cookies в production. Мутирующие API проверяют Origin/Referer. Server Actions — встроенная защита Next.js.",
  },
  {
    icon: Shield,
    title: "Rate limiting",
    description:
      "Redis в production (fail-closed без Redis): вход, AI, verify сертификатов, upload, submit тестов/практик, admin export.",
  },
  {
    icon: Cookie,
    title: "HTTP security headers",
    description:
      "CSP (report-only → enforce), HSTS, X-Frame-Options, Referrer-Policy, COOP/CORP. Отчёты CSP — в audit log.",
  },
  {
    icon: Upload,
    title: "Безопасная загрузка файлов",
    description:
      "Allowlist расширений, лимит размера, magic bytes, запрет path traversal. Скачивание practice — только владелец или admin.",
  },
  {
    icon: Activity,
    title: "Audit log",
    description:
      "Auth, admin, сертификаты, AI refusals, CSP. Метаданные без паролей, токенов и полных prompt/ответов LLM.",
  },
  {
    icon: FileCheck,
    title: "Честная проверка",
    description:
      "Оценка тестов и практик на сервере. Клиент не получает эталоны до завершения попытки. Server Actions с ownership guard.",
  },
  {
    icon: Bot,
    title: "AI-наставник",
    description:
      "Запрещённые ключи assessment data, серверный контекст из БД, pre/post модерация, отказ на списывание, rate limit user+IP.",
  },
] as const;

export function PublicSecurityPage() {
  return (
    <div className="space-y-8">
      <header className="space-y-3">
        <p className="font-mono text-[10px] uppercase tracking-widest text-primary">CyberEdu Academy</p>
        <h1 className="font-display text-3xl font-semibold tracking-tight text-foreground">
          Безопасность платформы
        </h1>
        <p className="max-w-2xl text-pretty text-muted-foreground">
          Курс посвящён информационной безопасности — платформа демонстрирует те же принципы: defense in depth,
          server-side truth и минимизация данных. Здесь — обзор для студентов и ревьюеров без раскрытия секретов и
          внутренних путей.
        </p>
      </header>

      <SectionCard variant="lab" title="Принципы" className="text-sm">
        <ul className="grid gap-2 sm:grid-cols-2">
          <li className="flex gap-2 text-muted-foreground">
            <ShieldCheck className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden />
            <span>
              <strong className="text-foreground">Fail-closed</strong> — в production без Redis чувствительные лимиты
              отклоняют запрос, а не обходят защиту.
            </span>
          </li>
          <li className="flex gap-2 text-muted-foreground">
            <ShieldCheck className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden />
            <span>
              <strong className="text-foreground">Server-side truth</strong> — оценки, RBAC и AI-контекст только на
              сервере.
            </span>
          </li>
        </ul>
      </SectionCard>

      <ul className="grid list-none gap-4 p-0 sm:grid-cols-2">
        {CONTROLS.map((item) => {
          const Icon = item.icon;
          return (
            <li key={item.title}>
              <SectionCard variant="default" className="h-full">
                <div className="flex gap-3">
                  <span className="flex size-10 shrink-0 items-center justify-center rounded-lg border border-primary/25 bg-primary/10 text-primary">
                    <Icon className="size-5" aria-hidden />
                  </span>
                  <div className="min-w-0">
                    <h2 className="font-display text-base font-semibold text-foreground">{item.title}</h2>
                    <p className="mt-1 text-sm text-pretty text-muted-foreground">{item.description}</p>
                  </div>
                </div>
              </SectionCard>
            </li>
          );
        })}
      </ul>

      <SectionCard variant="muted" title="Документация для команды" className="text-sm text-muted-foreground">
        <p>
          Техническая модель угроз и чеклист релиза — в репозитории проекта (
          <code className="text-xs">cyberedu/docs/THREAT_MODEL.md</code>,{" "}
          <code className="text-xs">SECURITY.md</code>,{" "}
          <code className="text-xs">SECURITY_PLATFORM.md</code>,{" "}
          <code className="text-xs">checklists/SECURITY_CHECKLIST.md</code>). Перед деплоем:{" "}
          <code className="text-xs">npm run test:security</code> в frontend.
        </p>
        <p className="mt-3">
          Сообщить об уязвимости: см.{" "}
          <Link href="/.well-known/security.txt" className="text-primary hover:underline">
            security.txt
          </Link>
          .
        </p>
      </SectionCard>

      <div className="flex flex-wrap gap-3">
        <Link
          href="/"
          className="inline-flex min-h-10 items-center rounded-lg border border-border/80 px-4 text-sm font-medium text-foreground hover:bg-muted/40"
        >
          ← На главную
        </Link>
        <Link
          href="/auth/login"
          className="inline-flex min-h-10 items-center rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground hover:bg-primary/90"
        >
          Войти в кабинет
        </Link>
      </div>
    </div>
  );
}
