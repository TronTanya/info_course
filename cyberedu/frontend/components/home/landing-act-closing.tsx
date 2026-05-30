import Link from "next/link";
import { CheckCircle2, ClipboardCheck, FlaskConical, QrCode, ShieldCheck, User } from "lucide-react";
import { BrandLogoMark } from "@/components/brand/brand-logo";
import { LandingSection } from "@/components/home/landing-section";
import { Button } from "@/components/ui/button";
import { authSafe } from "@/lib/auth";
import { guestAuthLinks } from "@/lib/design-system/nav-config";

const requirements = [
  { icon: CheckCircle2, text: "Пройти все модули курса по порядку трека." },
  { icon: ClipboardCheck, text: "Сдать тесты с проходным баллом платформы." },
  { icon: FlaskConical, text: "Выполнить практические лаборатории." },
  { icon: User, text: "Заполнить профиль для выпуска сертификата." },
] as const;

/** Act 3 — certificate proof + primary CTA */
export async function LandingActClosing() {
  const session = await authSafe();
  const isAuthenticated = Boolean(session?.user);
  const primaryHref = isAuthenticated
    ? session?.user?.role === "ADMIN"
      ? "/admin"
      : "/dashboard/course"
    : "/auth/register";
  const primaryLabel = isAuthenticated ? "Перейти в кабинет" : "Создать аккаунт";

  return (
    <LandingSection
      id="start"
      eyebrow="Начать"
      title="Подтвердите результат и начните бесплатно"
      description="Сертификат с QR и публичной проверкой — после полного прохождения программы. Первый модуль доступен сразу после регистрации."
      accent
    >
      <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(280px,380px)] lg:items-center lg:gap-12">
        <div className="space-y-6">
          <div>
            <h3 className="font-heading text-lg font-semibold text-foreground">Требования к сертификату</h3>
            <ul className="mt-4 space-y-3">
              {requirements.map(({ icon: Icon, text }) => (
                <li key={text} className="flex items-start gap-3 text-sm">
                  <span className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-xl border border-primary/20 bg-primary/8 text-primary">
                    <Icon className="size-4" strokeWidth={1.75} aria-hidden />
                  </span>
                  <span className="text-pretty leading-relaxed text-muted-foreground">{text}</span>
                </li>
              ))}
            </ul>
          </div>
          <ul className="flex flex-wrap gap-4 text-sm text-muted-foreground">
            <li className="flex items-center gap-2">
              <QrCode className="size-4 text-primary" aria-hidden />
              PDF + QR
            </li>
            <li className="flex items-center gap-2">
              <ShieldCheck className="size-4 text-primary" aria-hidden />
              Публичная проверка
            </li>
          </ul>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <Button asChild size="lg" className="w-full sm:w-auto">
              <Link href={primaryHref}>{primaryLabel}</Link>
            </Button>
            {!isAuthenticated ? (
              <Button asChild size="lg" variant="outline" className="w-full sm:w-auto">
                <Link href={guestAuthLinks.cabinetLogin}>Уже есть аккаунт</Link>
              </Button>
            ) : (
              <Button asChild size="lg" variant="outline" className="w-full sm:w-auto">
                <Link href="/dashboard/profile">Мой профиль</Link>
              </Button>
            )}
          </div>
        </div>

        <div className="ds-card relative mx-auto w-full max-w-md rounded-2xl p-6 sm:p-8">
          <div className="space-y-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="ds-typo-eyebrow">Сертификат</p>
                <p className="mt-1 font-heading text-lg font-semibold text-foreground">CyberEdu</p>
                <p className="text-xs text-muted-foreground">Практическая академия кибербезопасности</p>
              </div>
              <BrandLogoMark className="size-12 shrink-0" size={48} />
            </div>
            <div className="rounded-xl border border-border bg-muted/30 p-4 font-mono text-xs text-muted-foreground">
              <p>№ CE-2026-••••••</p>
              <p className="mt-2 text-foreground/80">Выпускник: И. О. Фамилия</p>
              <p className="mt-1">Дата выдачи: —</p>
            </div>
            <p className="text-center text-xs text-muted-foreground">Образец оформления</p>
          </div>
        </div>
      </div>
    </LandingSection>
  );
}
