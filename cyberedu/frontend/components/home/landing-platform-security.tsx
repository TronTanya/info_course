import Link from "next/link";
import { ShieldCheck } from "lucide-react";
import { LandingFeatureCard } from "@/components/home/landing-feature-card";
import { LandingSection } from "@/components/home/landing-section";
import { LandingSecurityCore } from "@/components/home/landing-security-core";
import { LANDING_SECURITY_FEATURES, LANDING_SECTION_IDS } from "@/lib/landing-content";

export function LandingPlatformSecurity() {
  return (
    <LandingSection
      id={LANDING_SECTION_IDS.security}
      eyebrow="Доверие"
      title="Платформа построена с учётом безопасности"
      description="CyberEdu — учебная среда, где защита встроена в продукт: доступ по ролям, контроль действий, честная проверка заданий и подтверждаемые сертификаты."
      accent
      panel
    >
      <div className="grid min-w-0 gap-10 lg:grid-cols-[minmax(260px,360px)_minmax(0,1fr)] lg:items-center">
        <div className="ce-landing-security-visual relative mx-auto w-full max-w-md rounded-2xl border border-primary/20 bg-card/40 p-6 sm:p-8 lg:mx-0">
          <LandingSecurityCore />
          <p className="mt-4 text-center text-xs leading-relaxed text-muted-foreground">
            Учебные данные и проверки — в контролируемой среде, без лишнего раскрытия служебной информации.
          </p>
        </div>

        <ul className="grid min-w-0 list-none gap-4 p-0 sm:grid-cols-2">
          {LANDING_SECURITY_FEATURES.map((item) => {
            const Icon = item.icon;
            return (
              <li key={item.title} className="min-w-0">
                <LandingFeatureCard
                  icon={<Icon className="size-5" strokeWidth={1.75} aria-hidden />}
                  title={item.title}
                  description={item.description}
                  className="h-full"
                />
              </li>
            );
          })}
        </ul>
      </div>

      <aside
        className="mx-auto mt-8 flex max-w-3xl flex-wrap items-center justify-center gap-x-6 gap-y-2 rounded-2xl border border-border/80 bg-muted/20 px-5 py-4 text-center text-sm text-muted-foreground"
        aria-label="Примечание о конфиденциальности"
      >
        <ShieldCheck className="size-4 shrink-0 text-primary" aria-hidden />
        <span>
          Мы не публикуем ключи, токены и внутренние настройки —{" "}
          <Link href="/security" className="text-primary hover:underline">
            подробнее о безопасности платформы
          </Link>
          .
        </span>
      </aside>
    </LandingSection>
  );
}
