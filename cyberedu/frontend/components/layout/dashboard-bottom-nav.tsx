"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, useReducedMotion } from "framer-motion";
import { LayoutGrid } from "lucide-react";
import { MobileMoreSheet } from "@/components/layout/mobile-more-sheet";
import { studentMobileTabKeys, studentQuickNav } from "@/lib/design-system/nav-config";
import { openMentorChat } from "@/lib/ai/mentor-ui/open";
import { useStudentNavModuleId } from "@/hooks/use-student-nav-module-id";
import { isStudentQuickNavActive, resolveStudentNavPaths, type StudentQuickNavKey } from "@/lib/nav-resolve";
import { cn } from "@/lib/utils";

const LABELS: Record<StudentQuickNavKey, string> = {
  dashboard: "Домой",
  course: "Курс",
  lessons: "Уроки",
  tests: "Тест",
  practice: "Лаб",
  mentor: "AI",
  profile: "Профиль",
};

const navByKey = Object.fromEntries(studentQuickNav.map((item) => [item.key, item])) as Record<
  StudentQuickNavKey,
  (typeof studentQuickNav)[number]
>;

/** Premium floating tab bar — Linear / iOS style (< lg). */
export function DashboardBottomNav() {
  const pathname = usePathname() ?? "";
  const moduleId = useStudentNavModuleId();
  const paths = resolveStudentNavPaths(pathname, moduleId);
  const reduce = useReducedMotion();
  const [moreOpen, setMoreOpen] = useState(false);

  return (
    <>
      <nav className="ce-mobile-tab-bar lg:hidden" aria-label="Основная навигация">
        <div className="ce-mobile-tab-bar__dock">
          <div className="ce-mobile-tab-bar__grid">
            {studentMobileTabKeys.map((key) => {
              const item = navByKey[key];
              if (!item) return null;
              const isCenter = key === "mentor";
              const active =
                key === "mentor"
                  ? false
                  : isStudentQuickNavActive(pathname, key) ||
                    (key === "course" &&
                      (isStudentQuickNavActive(pathname, "lessons") ||
                        isStudentQuickNavActive(pathname, "tests")));

              const Icon = item.icon;

              if (isCenter) {
                return (
                  <button
                    key={key}
                    type="button"
                    className={cn("ce-mobile-tab-item ce-mobile-tab-item--center")}
                    onClick={() => openMentorChat()}
                    aria-label="AI-наставник"
                  >
                    <span className="ce-mobile-tab-item__icon">
                      <Icon className="size-5" aria-hidden />
                    </span>
                    <span className="ce-mobile-tab-item__label">{LABELS[key]}</span>
                  </button>
                );
              }

              return (
                <Link
                  key={key}
                  href={paths[key]}
                  className={cn("relative ce-mobile-tab-item", active && "ce-mobile-tab-item--active")}
                  aria-current={active ? "page" : undefined}
                >
                  {active && !reduce ? (
                    <motion.span
                      layoutId="mobile-tab-glow"
                      className="pointer-events-none absolute inset-1 rounded-xl bg-primary/10"
                      transition={{ type: "spring", stiffness: 420, damping: 34 }}
                    />
                  ) : null}
                  <span className="ce-mobile-tab-item__icon relative z-1">
                    <Icon className="size-5" aria-hidden />
                  </span>
                  <span className="ce-mobile-tab-item__label relative z-1">{LABELS[key]}</span>
                </Link>
              );
            })}
          </div>
          <div className="mt-1 flex justify-center border-t border-white/6 pt-1">
            <button
              type="button"
              className="ce-mobile-tab-more gap-1.5 px-3 text-2.5 font-semibold uppercase tracking-wider text-muted-foreground"
              onClick={() => setMoreOpen(true)}
              aria-haspopup="dialog"
              aria-expanded={moreOpen}
            >
              <LayoutGrid className="size-3.5" aria-hidden />
              Ещё
            </button>
          </div>
        </div>
      </nav>
      <MobileMoreSheet open={moreOpen} onClose={() => setMoreOpen(false)} />
    </>
  );
}
