"use client";

import Image from "next/image";
import Link from "next/link";
import { LandingSection } from "@/components/home/landing-section";
import { Button } from "@/components/ui/button";

/** PNG в `public/screenshots/` — синхронизируются из `npm run screenshots` (см. scripts/copy-screenshots-to-public.mjs). */
const shots = [
  { src: "/screenshots/02-dashboard.png", alt: "Кабинет студента", label: "Кабинет" },
  { src: "/screenshots/03-course.png", alt: "Карта курса", label: "Курс" },
  { src: "/screenshots/04-lesson.png", alt: "Страница лекции", label: "Лекция" },
  { src: "/screenshots/05-test.png", alt: "Модульный тест", label: "Тест" },
] as const;

function ScreenshotCard({ src, alt, label }: (typeof shots)[number]) {
  return (
    <figure className="ce-glass overflow-hidden rounded-2xl border border-border/70 ring-1 ring-primary/10">
      <div className="relative aspect-video bg-muted/40">
        <Image
          src={src}
          alt={alt}
          fill
          className="object-cover object-top"
          sizes="(max-width: 640px) 100vw, 25vw"
        />
      </div>
      <figcaption className="border-t border-border/60 px-3 py-2 text-center text-xs font-medium text-muted-foreground">
        {label}
      </figcaption>
    </figure>
  );
}

export function LandingScreenshotsPreview() {
  return (
    <LandingSection
      id="screenshots"
      eyebrow="Интерфейс"
      title="Как выглядит платформа"
      description="Реальные экраны учебного окружения. Полный набор: cyberedu/docs/screenshots (npm run screenshots)."
    >
      <div className="space-y-8">
        <div className="grid min-w-0 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {shots.map((s) => (
            <ScreenshotCard key={s.label} {...s} />
          ))}
        </div>
        <div className="flex flex-wrap justify-center gap-3">
          <Button asChild variant="outline">
            <Link href="/auth/login">Войти и посмотреть</Link>
          </Button>
          <Button asChild variant="ghost">
            <Link href="/reviews">Отзывы студентов</Link>
          </Button>
        </div>
      </div>
    </LandingSection>
  );
}
