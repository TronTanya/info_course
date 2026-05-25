import Link from "next/link";
import { ArrowRight, CheckCircle2, ClipboardCheck, FlaskConical } from "lucide-react";
import { LandingCertificatePreview } from "@/components/home/landing-certificate-preview";
import { LandingSection } from "@/components/home/landing-section";
import { Button } from "@/components/ui/button";
import { LANDING_CERTIFICATE_INTRO, LANDING_SECTION_IDS } from "@/lib/landing-content";

const steps = [
  {
    icon: CheckCircle2,
    text: "Завершите все модули: уроки, тесты и практики.",
  },
  {
    icon: ClipboardCheck,
    text: "Профиль с именем для выпуска — как в сертификате.",
  },
  {
    icon: FlaskConical,
    text: "Скачайте PDF в кабинете и передайте ID для проверки.",
  },
] as const;

export function LandingCertificates() {
  return (
    <LandingSection
      id={LANDING_SECTION_IDS.certificate}
      eyebrow="Сертификат"
      title="Подтверждение ваших знаний"
      description={LANDING_CERTIFICATE_INTRO}
      accent
    >
      <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(300px,420px)] lg:items-center lg:gap-12">
        <div className="flex flex-col gap-6 sm:gap-8">
          <ul className="space-y-3">
            {steps.map(({ icon: Icon, text }) => (
              <li key={text} className="flex items-start gap-3">
                <span className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-xl border border-primary/25 bg-primary/10 text-primary">
                  <Icon className="size-4" strokeWidth={1.75} aria-hidden />
                </span>
                <span className="text-pretty text-sm leading-relaxed text-muted-foreground">{text}</span>
              </li>
            ))}
          </ul>

          <p className="rounded-xl border border-border/80 bg-muted/20 px-4 py-3 text-sm leading-relaxed text-muted-foreground">
            Уникальный идентификатор и страница проверки доступны любому работодателю или преподавателю — без входа в
            кабинет студента.
          </p>

          <Button asChild variant="primary" size="lg" className="w-full sm:w-auto sm:min-w-[240px]">
            <Link href={`#${LANDING_SECTION_IDS.howItWorks}`}>
              Как получить сертификат
              <ArrowRight className="size-4" aria-hidden />
            </Link>
          </Button>
        </div>

        <LandingCertificatePreview className="lg:justify-self-end" />
      </div>
    </LandingSection>
  );
}
