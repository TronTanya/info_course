import Link from "next/link";
import { ArrowRight, BookOpen, ClipboardCheck, FlaskConical } from "lucide-react";
import { LandingSection } from "@/components/home/landing-section";
import { Button } from "@/components/ui/button";
import { SectionCard } from "@/components/ui/section-card";
import { authSafe } from "@/lib/auth";
import { getLandingCoursePreview, type LandingModulePreview } from "@/lib/landing-public";
import { cn } from "@/lib/utils";

const FALLBACK_MODULES: LandingModulePreview[] = [
  { orderNumber: 1, title: "Основы информационной безопасности", lessonCount: 1, testCount: 1, practiceCount: 1 },
  { orderNumber: 2, title: "Сети и периметр", lessonCount: 1, testCount: 1, practiceCount: 1 },
  { orderNumber: 3, title: "Linux для аналитика", lessonCount: 1, testCount: 1, practiceCount: 1 },
  { orderNumber: 4, title: "Web Security", lessonCount: 1, testCount: 1, practiceCount: 1 },
  { orderNumber: 5, title: "Криптография", lessonCount: 1, testCount: 1, practiceCount: 1 },
  { orderNumber: 6, title: "SOC и журналы", lessonCount: 1, testCount: 1, practiceCount: 1 },
];

function moduleStats(m: LandingModulePreview) {
  const parts: string[] = [];
  if (m.lessonCount > 0) parts.push(`${m.lessonCount} лекц.`);
  if (m.testCount > 0) parts.push(`${m.testCount} тест`);
  if (m.practiceCount > 0) parts.push(`${m.practiceCount} практ.`);
  return parts.length > 0 ? parts.join(" · ") : "Материалы в модуле";
}

export async function LandingModules() {
  const session = await authSafe();
  const preview = await getLandingCoursePreview();
  const modules = preview?.modules.length ? preview.modules : FALLBACK_MODULES;
  const startHref = session?.user ? "/dashboard/course" : "/auth/register";

  return (
    <LandingSection
      id="modules"
      eyebrow="Модули курса"
      title="Пошаговая программа"
      description={
        preview?.description ??
        "Каждый модуль открывается после завершения предыдущего: лекция, проверка знаний и практика в одном потоке."
      }
    >
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {modules.map((mod) => (
          <SectionCard
            key={`${mod.orderNumber}-${mod.title}`}
            variant="default"
            flushTitle
            className={cn(
              "group h-full transition-[transform,box-shadow,border-color] duration-200",
              "hover:-translate-y-0.5 hover:border-primary/25 hover:shadow-[var(--shadow-card-hover)]",
            )}
          >
            <div className="flex items-start justify-between gap-3">
              <span className="flex size-10 shrink-0 items-center justify-center rounded-xl border border-primary/20 bg-primary/10 font-mono text-sm font-bold text-primary">
                {String(mod.orderNumber).padStart(2, "0")}
              </span>
              <span className="rounded-lg border border-border/80 bg-muted/40 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
                модуль
              </span>
            </div>
            <h3 className="mt-3 font-display text-lg font-semibold leading-snug text-foreground">{mod.title}</h3>
            <p className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
              <span className="inline-flex items-center gap-1">
                <BookOpen className="size-3.5" aria-hidden />
                {moduleStats(mod)}
              </span>
            </p>
            <div className="mt-4 flex flex-wrap gap-2 text-[10px] font-medium uppercase tracking-wide text-subtle-foreground">
              <span className="inline-flex items-center gap-1 rounded-md border border-border/80 bg-muted/30 px-2 py-1">
                <BookOpen className="size-3" aria-hidden /> лекция
              </span>
              <span className="inline-flex items-center gap-1 rounded-md border border-border/80 bg-muted/30 px-2 py-1">
                <ClipboardCheck className="size-3" aria-hidden /> тест
              </span>
              <span className="inline-flex items-center gap-1 rounded-md border border-border/80 bg-muted/30 px-2 py-1">
                <FlaskConical className="size-3" aria-hidden /> практика
              </span>
            </div>
          </SectionCard>
        ))}
      </div>

      <div className="flex flex-col items-start gap-3 border-t border-border/80 pt-8 sm:flex-row sm:items-center sm:justify-between">
        <p className="max-w-xl text-sm text-muted-foreground">
          {preview ? (
            <>
              Курс «{preview.title}» — {modules.length} активных модулей. Прогресс сохраняется в личном кабинете.
            </>
          ) : (
            <>Демонстрационная структура программы. После регистрации откроется актуальный каталог модулей.</>
          )}
        </p>
        <Button asChild variant="primary" className="w-full sm:w-auto">
          <Link href={startHref}>
            Начать с первого модуля
            <ArrowRight className="size-4" aria-hidden />
          </Link>
        </Button>
      </div>
    </LandingSection>
  );
}
