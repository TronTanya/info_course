import type { ReactNode } from "react";
import Link from "next/link";
import { Award, ShieldAlert, ShieldCheck } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { SectionCard } from "@/components/ui/section-card";
import { cn } from "@/lib/utils";

export type CertificateVerifyResult =
  | { status: "valid"; courseTitle: string; courseHours: number; certificateNumber: string; issuedAtLabel: string }
  | { status: "invalid" }
  | { status: "rate_limited" };

export function CertificateVerifyView({ result }: { result: CertificateVerifyResult }) {
  if (result.status === "rate_limited") {
    return (
      <VerifyShell>
        <VerifyStatusCard
          valid={false}
          title="Слишком много запросов"
          description="Повторите проверку позже. Это защищает реестр от злоупотреблений."
        />
        <Button variant="outline" asChild>
          <Link href="/">На главную</Link>
        </Button>
      </VerifyShell>
    );
  }

  if (result.status === "invalid") {
    return (
      <VerifyShell>
        <VerifyStatusCard
          valid={false}
          title="Сертификат не найден"
          description="Запись с указанным кодом отсутствует в реестре CyberEdu Academy. Проверьте ссылку или обратитесь к владельцу документа."
        />
        <Button variant="outline" asChild>
          <Link href="/">На главную</Link>
        </Button>
      </VerifyShell>
    );
  }

  return (
    <VerifyShell>
      <article className="ce-cert-verify-card w-full max-w-lg overflow-hidden rounded-2xl border border-success/30 bg-card shadow-card">
        <div className="border-b border-success/20 bg-success/8 px-6 py-5">
          <h2 className="sr-only">Результат проверки</h2>
          <div className="flex items-center gap-3">
            <span className="flex size-12 items-center justify-center rounded-xl bg-success/15 text-success">
              <ShieldCheck className="size-6" aria-hidden />
            </span>
            <div>
              <p className="font-mono text-2.5 uppercase tracking-widest text-success">CyberEdu Academy</p>
              <h2 className="font-display text-xl font-semibold text-foreground">Проверка сертификата</h2>
            </div>
          </div>
          <Badge variant="success" className="mt-4 gap-1.5 px-3 py-1">
            <ShieldCheck className="size-3.5" aria-hidden />
            Статус: действителен
          </Badge>
        </div>

        <div className="space-y-4 px-6 py-5 text-sm">
          <p className="text-muted-foreground">
            Документ зарегистрирован в официальном реестре платформы. Персональные данные владельца на этой странице не
            публикуются.
          </p>
          <dl className="space-y-3">
            <div>
              <dt className="text-xs uppercase tracking-wide text-muted-foreground">Программа</dt>
              <dd className="mt-0.5 font-medium text-foreground">{result.courseTitle}</dd>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <dt className="text-xs uppercase tracking-wide text-muted-foreground">Дата выдачи</dt>
                <dd className="mt-0.5 font-medium text-foreground">{result.issuedAtLabel}</dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-wide text-muted-foreground">Объём</dt>
                <dd className="mt-0.5 font-medium text-foreground">{result.courseHours} ч.</dd>
              </div>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-wide text-muted-foreground">Номер в реестре</dt>
              <dd className="mt-0.5 font-mono text-sm font-semibold text-foreground">{result.certificateNumber}</dd>
            </div>
          </dl>
        </div>

        <div className="border-t border-border/60 px-6 py-4">
          <Button variant="outline" className="w-full sm:w-auto" asChild>
            <Link href="/">На главную CyberEdu</Link>
          </Button>
        </div>
      </article>
    </VerifyShell>
  );
}

function VerifyShell({ children }: { children: ReactNode }) {
  return (
    <div className="ce-cert-verify-page flex min-h-screen flex-col items-center justify-center px-4 py-16">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(ellipse_at_center,color-mix(in_oklab,var(--primary)_8%,transparent),transparent_70%)]" aria-hidden />
      <div className="relative z-10 flex w-full max-w-lg flex-col items-center gap-6">
        <h1 className="font-display text-center text-xl font-semibold text-foreground">Проверка сертификата</h1>
        {children}
      </div>
    </div>
  );
}

function VerifyStatusCard({
  valid,
  title,
  description,
}: {
  valid: boolean;
  title: string;
  description: string;
}) {
  return (
    <SectionCard
      variant="lab"
      className={cn("w-full", !valid && "border-danger/25")}
      title={title}
      description={description}
    >
      <div className="mt-4 flex items-center gap-2">
        {valid ? (
          <Award className="size-5 text-success" aria-hidden />
        ) : (
          <ShieldAlert className="size-5 text-danger" aria-hidden />
        )}
        <Badge variant={valid ? "success" : "danger"}>{valid ? "Действителен" : "Не найден"}</Badge>
      </div>
    </SectionCard>
  );
}
