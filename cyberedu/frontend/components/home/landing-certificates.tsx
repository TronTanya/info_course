import Link from "next/link";
import { QrCode, ShieldCheck, FileDown } from "lucide-react";
import { BrandLogoMark } from "@/components/brand/brand-logo";
import { Button } from "@/components/ui/button";
import { LandingSection } from "@/components/home/landing-section";

const highlights = [
  { icon: FileDown, text: "PDF для портфолио и HR" },
  { icon: QrCode, text: "QR и код проверки на сайте" },
  { icon: ShieldCheck, text: "Подпись платформы CyberEdu" },
] as const;

export function LandingCertificates() {
  return (
    <LandingSection
      id="certificates"
      eyebrow="Сертификаты"
      title="Подтвердите результат обучения"
      description="После прохождения всех модулей вы получаете электронный сертификат — не «галочку в профиле», а документ с проверкой."
    >
      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(300px,400px)] lg:items-center">
        <ul className="space-y-4">
          {highlights.map(({ icon: Icon, text }) => (
            <li key={text} className="flex items-center gap-3 text-sm text-foreground">
              <span className="flex size-10 shrink-0 items-center justify-center rounded-xl border border-primary/25 bg-primary/10 text-primary">
                <Icon className="size-5" strokeWidth={1.75} aria-hidden />
              </span>
              {text}
            </li>
          ))}
          <li className="pt-2">
            <Button asChild variant="primary">
              <Link href="/auth/register">Начать путь к сертификату</Link>
            </Button>
          </li>
        </ul>

        <div className="ce-cert-card border-glow relative mx-auto w-full max-w-md p-6 sm:p-8">
          <div className="pointer-events-none absolute -right-12 -top-8 h-32 w-32 rounded-full bg-accent/15 blur-2xl" aria-hidden />
          <div className="relative space-y-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="typo-eyebrow text-primary">Certificate</p>
                <p className="mt-1 font-display text-lg font-semibold text-foreground">CyberEdu</p>
                <p className="text-xs text-muted-foreground">Основы информационной безопасности</p>
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
