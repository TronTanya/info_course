import Link from "next/link";
import { Suspense } from "react";
import { Mail } from "lucide-react";
import { AuthGlassCard } from "@/components/auth/auth-glass-card";
import { AuthFormFooter } from "@/components/auth/auth-form-footer";
import { AuthStatusSteps } from "@/components/auth/auth-status-steps";
import { VerifyEmailAutoRedirect } from "@/components/auth/verify-email-auto-redirect";
import { Button } from "@/components/ui/button";
import { FormMessage } from "@/components/ui/form-message";
import { LoadingState } from "@/components/ui/loading-state";
import { authSafe } from "@/lib/auth";
import { safeCallbackUrl } from "@/lib/auth/safe-callback-url";
import { verifyEmailToken, sendVerificationEmailAction } from "@/lib/actions/email-verification";
import { buildPublicMetadata } from "@/lib/seo/build-page-metadata";

export const metadata = buildPublicMetadata({
  title: "Подтверждение email",
  description: "Подтвердите email для доступа к защищённым разделам CyberEdu.",
  path: "/auth/verify-email",
});

async function VerifyEmailContent({
  searchParams,
}: {
  searchParams: Promise<{ token?: string; callbackUrl?: string; sent?: string; verify_sent?: string }>;
}) {
  const session = await authSafe();
  const qp = await searchParams;
  const callbackUrl = safeCallbackUrl(qp.callbackUrl);
  const token = (qp.token ?? "").trim();
  const sentState = (qp.sent ?? "").trim();
  const verifySentBanner = (qp.verify_sent ?? "").trim() === "1";

  let verification:
    | { kind: "verified" }
    | { kind: "invalid" | "expired" | "already_verified" }
    | { kind: "none" } = { kind: "none" };
  if (token.length > 0) {
    const result = await verifyEmailToken(token);
    if (result.ok) verification = { kind: "verified" };
    else verification = { kind: result.reason };
  }

  const isAuthedUser = Boolean(session?.user?.id);
  const isAlreadyVerified = Boolean(session?.user?.emailVerified);
  const shouldAutoRedirect =
    verification.kind === "verified" ||
    verification.kind === "already_verified" ||
    isAlreadyVerified;

  const userEmail = session?.user?.email?.trim();

  return (
    <AuthGlassCard
      title="Подтверждение email"
      description={
        userEmail
          ? `Подтвердите ${userEmail}, чтобы открыть кабинет, тесты и лаборатории.`
          : "Для доступа к личному кабинету подтвердите адрес электронной почты."
      }
      footer={
        <AuthFormFooter>
          <Link className="font-semibold text-primary underline-offset-4 hover:underline" href="/auth/login">
            Вернуться ко входу
          </Link>
        </AuthFormFooter>
      }
    >
      <div className="space-y-5">
        {!shouldAutoRedirect ? (
          <div className="flex flex-col gap-3 rounded-xl border border-primary/20 bg-primary/8 px-4 py-3 sm:flex-row sm:items-start">
            <Mail className="size-5 shrink-0 text-primary sm:mt-0.5" aria-hidden />
            <div className="min-w-0 flex-1">
            <AuthStatusSteps
              steps={[
                {
                  title: "Откройте письмо от CyberEdu",
                  description: "Проверьте папку «Спам», если письма нет во входящих.",
                  done: verifySentBanner || sentState === "ok",
                },
                {
                  title: "Нажмите ссылку подтверждения",
                  description: "Ссылка одноразовая и действует ограниченное время.",
                  done: verification.kind === "verified",
                },
                {
                  title: "Вернитесь в кабинет",
                  description: "После подтверждения откроются все разделы курса.",
                  done: shouldAutoRedirect,
                },
              ]}
            />
            </div>
          </div>
        ) : null}

        {verifySentBanner ? (
          <FormMessage variant="success">Письмо с подтверждением отправлено. Проверьте входящие и спам.</FormMessage>
        ) : null}
        {verification.kind === "verified" ? (
          <FormMessage variant="success">Email подтверждён. Теперь можно продолжить обучение.</FormMessage>
        ) : null}
        {verification.kind === "invalid" ? (
          <FormMessage>Ссылка недействительна. Запросите новое письмо.</FormMessage>
        ) : null}
        {verification.kind === "expired" ? (
          <FormMessage>Срок действия ссылки истёк. Запросите новое письмо.</FormMessage>
        ) : null}
        {verification.kind === "already_verified" ? (
          <FormMessage variant="success">Email уже подтверждён.</FormMessage>
        ) : null}

        {sentState === "ok" ? (
          <FormMessage variant="success">Письмо отправлено. Проверьте входящие и спам.</FormMessage>
        ) : null}
        {sentState === "rate_limited" ? (
          <FormMessage>Слишком много запросов. Попробуйте отправить письмо позже.</FormMessage>
        ) : null}
        {sentState === "unavailable" ? (
          <FormMessage>Сервис отправки писем временно недоступен. Попробуйте позже.</FormMessage>
        ) : null}

        {shouldAutoRedirect ? (
          <>
            <VerifyEmailAutoRedirect callbackUrl={callbackUrl} enabled />
            <Button asChild className="w-full" size="lg" variant="secondary">
              <Link href={callbackUrl}>Перейти сейчас</Link>
            </Button>
          </>
        ) : null}

        {!isAlreadyVerified && isAuthedUser ? (
          <form action={sendVerificationEmailAction}>
            <Button className="w-full" size="lg" type="submit" variant="outline">
              Отправить письмо повторно
            </Button>
          </form>
        ) : null}

        {!isAuthedUser ? (
          <div className="text-sm text-muted-foreground">
            Войдите в аккаунт, чтобы отправить новое письмо подтверждения.
          </div>
        ) : null}
      </div>
    </AuthGlassCard>
  );
}

export default function VerifyEmailPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string; callbackUrl?: string; sent?: string; verify_sent?: string }>;
}) {
  return (
    <Suspense fallback={<LoadingState size="sm" label="Проверяем статус email…" />}>
      <VerifyEmailContent searchParams={searchParams} />
    </Suspense>
  );
}
