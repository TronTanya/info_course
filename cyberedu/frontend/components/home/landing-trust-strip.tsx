import { LandingSection } from "@/components/home/landing-section";
import { LANDING_TRUST_ITEMS } from "@/lib/landing-content";

export function LandingTrustStrip() {
  return (
    <LandingSection
      id="trust"
      eyebrow="Почему CyberEdu"
      title="Всё для практики ИБ — в одном контуре"
      description="Курс, лаборатории, наставник и сертификат без разрозненных инструментов."
      headerClassName="max-w-2xl"
    >
      <ul className="grid list-none gap-3 p-0 sm:grid-cols-2 lg:grid-cols-4">
        {LANDING_TRUST_ITEMS.map(({ icon: Icon, title, description }) => (
          <li
            key={title}
            className="ce-landing-glass-tile ce-landing-value-pill flex min-h-[5.5rem] flex-col gap-2.5 rounded-2xl p-5"
          >
            <span className="flex size-10 items-center justify-center rounded-xl border border-primary/25 bg-primary/10 text-primary">
              <Icon className="size-4" strokeWidth={1.75} aria-hidden />
            </span>
            <span className="font-display text-sm font-semibold text-foreground">{title}</span>
            <span className="text-xs leading-relaxed text-pretty text-muted-foreground">{description}</span>
          </li>
        ))}
      </ul>
    </LandingSection>
  );
}
