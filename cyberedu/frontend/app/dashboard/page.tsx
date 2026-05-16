import type { Metadata } from "next";
import Link from "next/link";
import { BookOpen, Award, ClipboardList, Settings, User } from "lucide-react";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { MetricCard } from "@/components/ui/metric-card";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Кабинет",
};

const quickLinks = [
  {
    href: "/dashboard/course",
    title: "Курс",
    description: "Модули, лекции, тесты и практика",
    icon: BookOpen,
    accent: "from-primary/15 to-cyan/5",
  },
  {
    href: "/dashboard/profile",
    title: "Профиль",
    description: "ФИО, интересы для AI, аватар",
    icon: User,
    accent: "from-cyan/12 to-card",
  },
  {
    href: "/dashboard/my-assignments",
    title: "Мои задания",
    description: "Статусы практических работ",
    icon: ClipboardList,
    accent: "from-secondary/10 to-card",
  },
  {
    href: "/dashboard/certificate",
    title: "Сертификат",
    description: "PDF после завершения курса",
    icon: Award,
    accent: "from-warning/10 to-card",
  },
  {
    href: "/dashboard/settings",
    title: "Настройки",
    description: "Безопасность и уведомления",
    icon: Settings,
    accent: "from-muted/80 to-card",
  },
] as const;

const stagger = ["", "ce-stagger-1", "ce-stagger-2", "ce-stagger-3", "ce-stagger-4"] as const;

export default function DashboardHomePage() {
  return (
    <DashboardShell>
      <div className="space-y-8">
        <PageHeader
          eyebrow="CyberEdu"
          title="Личный кабинет"
          description="Продолжайте обучение с того места, где остановились. Навигация — в шапке, быстрые разделы — ниже."
        />

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <MetricCard label="Статус" value="Активен" hint="Учётная запись в порядке" className="ce-animate-in" />
          <MetricCard label="Формат" value="Онлайн" hint="Лекции, тесты, лаборатории" className="ce-animate-in ce-stagger-1" />
          <MetricCard
            label="Поддержка"
            value="AI"
            hint="Наставник в контексте урока"
            className="ce-animate-in ce-stagger-2 hidden lg:flex"
          />
        </div>

        <div className="responsive-card-grid">
          {quickLinks.map((item, i) => {
            const Icon = item.icon;
            return (
              <Card
                key={item.href}
                className={cn(
                  "ce-animate-in group relative overflow-hidden border-border/70 transition-all duration-300",
                  "hover:-translate-y-0.5 hover:border-primary/25 hover:shadow-card-hover motion-reduce:hover:translate-y-0",
                  stagger[i],
                )}
              >
                <div className={cn("pointer-events-none absolute inset-0 bg-linear-to-br opacity-80", item.accent)} aria-hidden />
                <CardHeader className="relative">
                  <div className="mb-3 flex size-11 items-center justify-center rounded-xl bg-card/80 text-primary shadow-sm ring-1 ring-border">
                    <Icon className="size-5" aria-hidden />
                  </div>
                  <CardTitle>{item.title}</CardTitle>
                  <CardDescription>{item.description}</CardDescription>
                </CardHeader>
                <CardContent className="relative">
                  <Link
                    className="inline-flex items-center gap-1 text-sm font-semibold text-primary underline-offset-4 transition-colors hover:underline"
                    href={item.href}
                  >
                    Открыть
                    <span aria-hidden>→</span>
                  </Link>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </DashboardShell>
  );
}
