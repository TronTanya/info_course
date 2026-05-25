import { LandingFaqAccordion } from "@/components/home/landing-faq-accordion";
import { LandingSection } from "@/components/home/landing-section";
import { LANDING_FAQ, LANDING_SECTION_IDS } from "@/lib/landing-content";

export function LandingFaq() {
  return (
    <LandingSection
      id={LANDING_SECTION_IDS.faq}
      eyebrow="FAQ"
      title="Частые вопросы"
      description="Коротко о формате, практике, AI, сертификате и работе преподавателя с курсом."
    >
      <LandingFaqAccordion items={LANDING_FAQ} />
    </LandingSection>
  );
}
