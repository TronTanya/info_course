import Link from "next/link";
import { CheckCircle2, ClipboardCheck, FlaskConical, QrCode, ShieldCheck, User } from "lucide-react";
import { BrandLogoMark } from "@/components/brand/brand-logo";
import { Button } from "@/components/ui/button";
import { LandingSection } from "@/components/home/landing-section";

const requirements = [
  {
    icon: CheckCircle2,
    text: "Пройти все модули курса — уроки и материалы по порядку трека.",
  },
  {
    icon: ClipboardCheck,
    text: "Сдать тесты по каждому модулю с проходным баллом платформы.",
  },
  {
    icon: FlaskConical,
    text: "Выполнить практические лаборатории: автопроверка или зачёт преподавателя.",
  },
  {
    icon: User,
    text: "Заполнить профиль — имя и данные для выпуска сертификата.",
  },
] as const;

const highlights = [
  { icon: QrCode, text: "PDF для портфолио с QR и кодом проверки" },
  { icon: ShieldCheck, text: "Публичная проверка подлинности на сайте" },
] as const;

export function LandingCertificates() {
  return (
    <LandingSection
      id="certificates"
      eyebrow="Сертификат"
      title="Подтвердите результат обучения"
      description="Сертификат выдаётся после полного прохождения трека — не «галочка в профиле», а документ с проверкой."
      accent
    >
      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(300px,400px)] lg:items-center">
        <div className="space-y-6">
          <div>
            <h3 className="font-display text-lg font-semibold text-foreground">Что нужно для получения</h3>
            <ul className="mt-4 space-y-3">
              {requirements.map(({ icon: Icon, text }) => (
                <li key={text} className="flex items-start gap-3 text-sm text-foreground">
                  <span className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-xl border border-primary/25 bg-primary/10 text-primary">
                    <Icon className="size-4" strokeWidth={1.75} aria-hidden />
                  </span>
                  <span className="text-pretty leading-relaxed text-muted-foreground">{text}</span>
                </li>
              ))}
            </ul>
          </div>
          <ul className="space-y-2 border-t border-border/60 pt-4">
            {highlights.map(({ icon: Icon, text }) => (
              <li key={text} className="flex items-center gap-2 text-sm text-muted-foreground">
                <Icon className="size-4 shrink-0 text-primary" aria-hidden />
                {text}
              </li>
            ))}
          </ul>
          <Button asChild variant="primary">
            <Link href="/auth/register">Начать путь к сертификату</Link>
          </Button>
        </div>

        <div className="ce-cert-card border-glow relative mx-auto w-full max-w-md p-6 sm:p-8">
          <div className="pointer-events-none absolute -right-12 -top-8 h-32 w-32 rounded-full bg-accent/15 blur-2xl" aria-hidden />
          <div className="relative space-y-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="typo-eyebrow text-primary">Certificate</p>
                <p className="mt-1 font-display text-lg font-semibold text-foreground">CyberEdu</p>
                <p className="text-xs text-muted-foreground">Практическая академия кибербезопасности</p>
              </div>
              <BrandLogoMark className="size-12 shrink-0" size={48} />
            </div>
            <div className="rounded-xl border border-border/60 bg-background/50 p-4 font-mono text-xs text-muted-foreground">
              <p>№ CE-2026-••••••</p>
              <p className="mt-2 text-foreground/80">Выпускник: И. О. Фамилия</p>
              <p className="mt-1">Дата выдачи: —</p>
            </div>
            <p className="text-center text-[10px] uppercase tracking-widest text-muted-foreground">Образец оформления</p>
          </div>
        </div>
      </div>
    </LandingSection>
  );
}
