import { Alert } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Input } from "@/components/ui/input";
import { PageHeader } from "@/components/ui/page-header";
import { ProgressBar } from "@/components/ui/progress-bar";
import { Select } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { StatusBadge } from "@/components/ui/status-badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { DesignSystemShowcase } from "@/components/internal/design-system-showcase";
import { UiKitInteractive } from "@/components/ui/ui-kit-interactive";
import { cn } from "@/lib/utils";

function CertificatePreviewDemo() {
  return (
    <div className="flex h-full min-h-22 flex-col justify-between">
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="font-mono text-2.5 font-semibold uppercase tracking-wider text-cyan">Certificate</p>
          <p className="mt-1 text-sm font-semibold text-foreground">CyberEdu</p>
          <p className="text-2.75 text-muted-foreground">Основы ИБ · PDF</p>
        </div>
        <div className="flex size-9 shrink-0 items-center justify-center rounded-lg border border-primary/30 bg-primary/10 text-xs font-bold text-primary">
          PDF
        </div>
      </div>
      <div className="mt-2 flex items-center justify-between border-t border-border/60 pt-2">
        <span className="font-mono text-2.5 text-muted-foreground">№ CE-2026-****</span>
        <span className="rounded-md bg-primary/10 px-2 py-0.5 text-2.5 font-medium text-primary">Подпись</span>
      </div>
    </div>
  );
}

function CourseCardDemo() {
  return (
    <Card className="border-sky-500/40 bg-linear-to-br from-card via-sky-500/6 to-card shadow-card ring-1 ring-inset ring-sky-500/15">
      <div className="h-1 w-full bg-linear-to-r from-sky-500 via-primary to-sky-400" aria-hidden />
      <CardHeader className="space-y-2 pb-2 pt-4">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Модуль 2</p>
            <CardTitle className="text-lg text-foreground">Угрозы и модель нарушителя</CardTitle>
          </div>
          <Badge variant="cyan" className="shrink-0">
            В процессе
          </Badge>
        </div>
        <CardDescription>Пример карточки модуля на странице курса: статус, описание, шаги.</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col gap-3 pt-0">
        <ProgressBar value={50} max={100} label="Шаги модуля" />
        <div className="flex flex-wrap gap-2 text-xs">
          <Badge variant="outline">Сложность: Стандарт</Badge>
          <Badge variant="outline">≈ 3–5 ч</Badge>
        </div>
        <Button type="button" variant="primary" className="mt-auto w-full" disabled>
          Продолжить (демо)
        </Button>
      </CardContent>
    </Card>
  );
}

function PracticeLabCardDemo() {
  return (
    <div className={cn("rounded-2xl border border-cyan-200/50 bg-white p-5 shadow-sm", "ring-1 ring-slate-200/80")}>
      <div className="flex flex-col gap-1 border-b border-slate-100 pb-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h3 className="text-base font-semibold text-foreground">Рабочая область</h3>
          <p className="text-xs text-muted-foreground">
            Компонент: <span className="font-mono text-foreground/80">PhishingEmailTask</span>
          </p>
        </div>
        <Badge variant="outline" className="w-fit border-border bg-muted/50 text-xs font-normal text-muted-foreground">
          Практика
        </Badge>
      </div>
      <p className="mt-3 text-xs leading-relaxed text-muted-foreground">Учебная симуляция: действия не выполняются в реальной почте.</p>
      <div className="mt-4 flex flex-wrap gap-2">
        <Button type="button" size="sm" variant="outline">
          Вариант A
        </Button>
        <Button type="button" size="sm" variant="outline">
          Вариант B
        </Button>
      </div>
    </div>
  );
}

export function UiKitShowcase({ variant = "admin" }: { variant?: "admin" | "dev" }) {
  const envNote =
    variant === "dev"
      ? "Маршрут /dev/ui-kit включён только при NODE_ENV=development."
      : "Маршрут /admin/ui-kit только для роли ADMIN.";

  return (
    <div className="space-y-10 pb-8">
      <PageHeader
        title="UI Kit"
        description="Витрина компонентов для разработки и согласования верстки."
        breadcrumb={
          <span className="text-muted-foreground">{variant === "dev" ? "Development · UI Kit" : "Админка · UI Kit"}</span>
        }
      />

      <Alert variant="warning" title="Внутренняя страница дизайн-системы">
        <p className="text-sm leading-relaxed">
          Не отображается студентам. Доступ только у администраторов. {envNote} В production пользователь без роли ADMIN
          получает ответ 404.
        </p>
      </Alert>

      <DesignSystemShowcase />

      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-foreground">Кнопки</h2>
        <Card>
          <CardHeader>
            <CardTitle>Button</CardTitle>
            <CardDescription>Варианты, размеры, loading.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-3">
            <Button type="button">Primary</Button>
            <Button type="button" variant="secondary">
              Secondary
            </Button>
            <Button type="button" variant="outline">
              Outline
            </Button>
            <Button type="button" variant="ghost">
              Ghost
            </Button>
            <Button type="button" variant="danger">
              Danger
            </Button>
            <Button type="button" loading>
              Загрузка
            </Button>
          </CardContent>
        </Card>
      </section>

      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-foreground">Поля ввода</h2>
        <Card>
          <CardHeader>
            <CardTitle>Input · Textarea · Select</CardTitle>
            <CardDescription>Поля форм личного кабинета и админки.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-6 md:grid-cols-2">
            <Input label="Email" name="demo-email" type="email" placeholder="student@university.edu" />
            <Input label="С ошибкой" error="Некорректное значение" defaultValue="wrong" />
            <div className="md:col-span-2">
              <Textarea label="Комментарий" hint="До 2000 символов" placeholder="Текст ответа…" />
            </div>
            <Select label="Уровень" name="level" defaultValue="base">
              <option value="base">Базовый</option>
              <option value="pro">Продвинутый</option>
            </Select>
          </CardContent>
        </Card>
      </section>

      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-foreground">Карточки</h2>
        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Базовая карточка</CardTitle>
              <CardDescription>Заголовок, описание, контент.</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">Текст внутри CardContent.</p>
            </CardContent>
          </Card>
          <Card className="border-primary/20 bg-primary/3">
            <CardHeader>
              <CardTitle>Акцентная</CardTitle>
              <CardDescription>С лёгким фоном primary.</CardDescription>
            </CardHeader>
            <CardContent>
              <Button type="button" size="sm" variant="outline">
                Действие
              </Button>
            </CardContent>
          </Card>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-foreground">Badges</h2>
        <Card>
          <CardHeader>
            <CardTitle>Badge · StatusBadge</CardTitle>
            <CardDescription>Статусы сущностей и цветовые варианты.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-6">
            <div className="flex flex-wrap gap-2">
              <Badge>default</Badge>
              <Badge variant="primary">primary</Badge>
              <Badge variant="secondary">secondary</Badge>
              <Badge variant="success">success</Badge>
              <Badge variant="warning">warning</Badge>
              <Badge variant="danger">danger</Badge>
              <Badge variant="cyan">cyan</Badge>
              <Badge variant="outline">outline</Badge>
            </div>
            <div className="flex flex-wrap gap-2">
              <StatusBadge status="loading" />
              <StatusBadge status="success" />
              <StatusBadge status="error" />
              <StatusBadge status="empty" />
              <StatusBadge status="locked" />
              <StatusBadge status="completed" />
              <StatusBadge status="in_progress" />
              <StatusBadge status="pending" />
              <StatusBadge status="warning" />
            </div>
          </CardContent>
        </Card>
      </section>

      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-foreground">Alerts</h2>
        <div className="grid gap-4 md:grid-cols-2">
          <Alert variant="info" title="Подсказка">
            AI-наставник задаёт наводящие вопросы и не выдаёт готовые ответы на практику.
          </Alert>
          <Alert variant="success" title="Сохранено">
            Профиль обновлён (пример success).
          </Alert>
          <Alert variant="warning" title="Внимание">
            Дедлайн модуля скоро.
          </Alert>
          <Alert variant="danger" title="Ошибка">
            Не удалось отправить форму.
          </Alert>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-foreground">Progress</h2>
        <Card>
          <CardContent className="space-y-6 pt-6">
            <ProgressBar label="Прогресс модуля" value={62} />
            <ProgressBar label="Предупреждение" value={88} tone="warning" />
            <ProgressBar label="Ошибка / порог" value={40} tone="danger" />
            <ProgressBar label="Успех" value={100} tone="success" />
          </CardContent>
        </Card>
      </section>

      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-foreground">Tabs</h2>
        <Card>
          <CardContent className="pt-6">
            <Tabs defaultValue="a">
              <TabsList>
                <TabsTrigger value="a">Материалы</TabsTrigger>
                <TabsTrigger value="b">AI</TabsTrigger>
              </TabsList>
              <TabsContent value="a" className="mt-3 text-sm text-muted-foreground">
                Содержимое вкладки.
              </TabsContent>
              <TabsContent value="b" className="mt-3 text-sm text-muted-foreground">
                Второй контент.
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </section>

      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-foreground">Modal</h2>
        <Card>
          <CardContent className="pt-6">
            <UiKitInteractive />
          </CardContent>
        </Card>
      </section>

      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-foreground">Empty state</h2>
        <EmptyState
          title="Нет отправок"
          description="Когда появятся работы на проверке, они отобразятся здесь."
          icon={
            <svg className="size-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden>
              <path d="M12 16v-4M12 8h.01" />
              <circle cx="12" cy="12" r="9" />
            </svg>
          }
          action={<Button type="button">Действие</Button>}
        />
      </section>

      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-foreground">Loading state</h2>
        <div className="rounded-2xl border border-border bg-card p-4 shadow-card">
          <Skeleton className="h-4 w-[66%]" />
          <Skeleton className="mt-2 h-4 w-full" />
          <Skeleton className="mt-3 h-24 w-full" />
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-foreground">Practice cards</h2>
        <p className="text-sm text-muted-foreground">Карточка рабочей области практики (лаборатория).</p>
        <div className="grid gap-4 md:grid-cols-2">
          <PracticeLabCardDemo />
          <PracticeLabCardDemo />
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-foreground">Course cards</h2>
        <p className="text-sm text-muted-foreground">Карточка модуля в каталоге курса.</p>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          <CourseCardDemo />
          <CourseCardDemo />
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-foreground">Certificate preview</h2>
        <p className="text-sm text-muted-foreground">Компактный блок превью сертификата (лендинг / дашборд).</p>
        <div className="max-w-md rounded-2xl border border-border/80 bg-linear-to-r from-card via-muted/20 to-card p-4 shadow-card ring-1 ring-inset ring-white/50">
          <CertificatePreviewDemo />
        </div>
      </section>
    </div>
  );
}
