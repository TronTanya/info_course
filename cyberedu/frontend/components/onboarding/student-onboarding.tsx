"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { BookOpen, Bot, Trophy, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useOverlayA11y } from "@/lib/hooks/use-overlay-a11y";
import { cn } from "@/lib/utils";

const STORAGE_KEY = "cyberedu_onboarding_v1_done";

const steps = [
  {
    icon: BookOpen,
    title: "Курс по модулям",
    body: "Идите по траектории: лекция → тест → практика. Следующий модуль откроется после завершения предыдущего.",
    href: "/dashboard/course",
    cta: "Открыть курс",
  },
  {
    icon: BookOpen,
    title: "Лекция и материалы",
    body: "Читайте оригинал, запрашивайте AI-объяснение и конспект. Отметьте лекцию изученной, чтобы открыть тест.",
    href: "/dashboard/course",
    cta: "К первому модулю",
  },
  {
    icon: Bot,
    title: "AI-наставник",
    body: "На мобильном — кнопка «AI» в нижней панели. На компьютере — плавающая кнопка в углу. Без готовых ответов на тесты и практику.",
    href: "/dashboard",
    cta: "Далее",
  },
  {
    icon: Trophy,
    title: "Достижения",
    body: "За модули и практику открываются бейджи в профиле. Следите за прогрессом на главной и в разделе «Профиль».",
    href: "/dashboard/profile",
    cta: "К профилю",
  },
] as const;

export function StudentOnboarding() {
  const reduce = useReducedMotion();
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(0);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    queueMicrotask(() => {
      try {
        if (localStorage.getItem(STORAGE_KEY) !== "1") setOpen(true);
      } catch {
        /* ignore */
      }
    });
  }, []);

  function finish() {
    try {
      localStorage.setItem(STORAGE_KEY, "1");
    } catch {
      /* ignore */
    }
    setOpen(false);
  }

  useOverlayA11y({
    open,
    onClose: finish,
    containerRef: panelRef,
  });

  const current = steps[step];
  const Icon = current.icon;

  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          className="fixed inset-0 z-(--z-onboarding) flex items-end justify-center p-4 sm:items-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.button
            type="button"
            className="absolute inset-0 bg-background/75 backdrop-blur-sm"
            aria-label="Закрыть быстрый старт"
            onClick={finish}
          />
          <motion.div
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="onboarding-title"
            className="ce-learn-panel relative w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-card"
            initial={reduce ? false : { opacity: 0, y: 24, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16 }}
            tabIndex={-1}
          >
            <button
              type="button"
              onClick={finish}
              className="absolute right-3 top-3 rounded-lg p-1.5 text-muted-foreground hover:bg-muted"
              aria-label="Закрыть"
            >
              <X className="size-4" />
            </button>
            <p className="font-mono text-2.5 uppercase tracking-widest text-cyan">Быстрый старт</p>
            <h2 id="onboarding-title" className="mt-2 text-lg font-semibold text-foreground">
              {current.title}
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{current.body}</p>
            <div className="mt-4 flex gap-1.5" role="tablist" aria-label="Шаги онбординга">
              {steps.map((_, i) => (
                <span
                  key={i}
                  role="tab"
                  aria-selected={i === step}
                  aria-label={`Шаг ${i + 1} из ${steps.length}`}
                  className={cn("h-1 flex-1 rounded-full transition-colors", i === step ? "bg-cyan" : "bg-muted")}
                />
              ))}
            </div>
            <div className="mt-6 flex flex-col gap-2 sm:flex-row">
              {step < steps.length - 1 ? (
                <>
                  <Button type="button" variant="outline" className="w-full sm:w-auto" onClick={finish}>
                    Пропустить
                  </Button>
                  <Button type="button" variant="primary" className="w-full sm:flex-1" onClick={() => setStep((s) => s + 1)}>
                    Далее
                  </Button>
                </>
              ) : (
                <Button type="button" variant="primary" className="w-full" asChild onClick={finish}>
                  <Link href={current.href}>{current.cta}</Link>
                </Button>
              )}
            </div>
            <div className="mt-4 flex items-center gap-2 text-primary">
              <Icon className="size-5" aria-hidden />
              <span className="text-xs text-muted-foreground">
                Шаг {step + 1} из {steps.length}
              </span>
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
