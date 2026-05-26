import Link from "next/link";
import { CyberHero } from "@/components/cyber/cyber-hero";
import { Button } from "@/components/ui/button";

export function LandingCta() {
  return (
    <CyberHero className="text-center" labelledBy="cta-heading" padding="spacious">
      <div className="mx-auto max-w-2xl space-y-10">
        <div className="space-y-5">
          <p className="typo-eyebrow text-primary">Deploy</p>
          <h2 id="cta-heading" className="typo-h2 ce-text-gradient text-balance">
            Активируйте свою среду обучения
          </h2>
          <p className="typo-body-muted text-pretty text-lg">
            Бесплатный старт. Первый модуль доступен сразу — теория, SOC, тесты и сертификат в едином AI-кабинете.
          </p>
        </div>
        <div className="flex flex-col items-stretch justify-center gap-3 sm:flex-row sm:items-center">
          <Button asChild size="lg" className="w-full sm:min-w-60 sm:w-auto">
            <Link href="/auth/register">Развернуть аккаунт</Link>
          </Button>
          <Button asChild size="lg" variant="outline" className="w-full border-primary/30 bg-card/90 sm:w-auto">
            <Link href="/#product">Посмотреть программу</Link>
          </Button>
        </div>
      </div>
    </CyberHero>
  );
}
