import type { Metadata } from "next";
import Link from "next/link";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata: Metadata = {
  title: "Кабинет",
};

export default function DashboardHomePage() {
  return (
    <DashboardShell>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">Личный кабинет</h1>
          <p className="mt-2 text-sm text-muted-foreground">Разделы — в меню сверху. Быстрый старт — карточки ниже или страница курса.</p>
        </div>
        <div className="responsive-card-grid">
          <Card>
            <CardHeader>
              <CardTitle>Профиль</CardTitle>
              <CardDescription>ФИО, интересы, аватар</CardDescription>
            </CardHeader>
            <CardContent>
              <Link className="text-sm font-medium text-primary underline-offset-4 hover:underline" href="/dashboard/profile">
                Открыть профиль →
              </Link>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Курс</CardTitle>
              <CardDescription>Модули и прогресс</CardDescription>
            </CardHeader>
            <CardContent>
              <Link className="text-sm font-medium text-primary underline-offset-4 hover:underline" href="/dashboard/course">
                Перейти к курсу →
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardShell>
  );
}
