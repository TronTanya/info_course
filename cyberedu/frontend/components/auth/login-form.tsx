"use client";

import { useEffect, useId, useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { getSession, signIn } from "next-auth/react";
import { AuthFormFooter } from "@/components/auth/auth-form-footer";
import { AuthGlassCard } from "@/components/auth/auth-glass-card";
import { PasswordInput } from "@/components/auth/password-input";
import { Button } from "@/components/ui/button";
import { AuthVerifySentBanner } from "@/components/auth/auth-verify-sent-banner";
import { FormMessage } from "@/components/ui/form-message";
import { Input } from "@/components/ui/input";
import { safeCallbackUrl } from "@/lib/auth/safe-callback-url";
import { AuthDevCredentialsHint } from "@/components/auth/auth-dev-credentials-hint";
import { loginSchema } from "@/lib/validation";

function authErrorMessage(code: string | null): string | null {
  if (!code) return null;
  switch (code) {
    case "CredentialsSignin":
      return "Неверный email или пароль. Проверьте данные или сбросьте пароль.";
    case "MissingCSRF":
      return "Сессия формы устарела. Обновите страницу и попробуйте снова.";
    default:
      return "Не удалось войти. Обновите страницу или попробуйте позже.";
  }
}

type LoginFieldErrors = {
  email?: string[];
  password?: string[];
};

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const formErrorId = useId();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<LoginFieldErrors>({});

  const registered = searchParams.get("registered") === "1";
  const verifySent = searchParams.get("verify_sent") === "1";
  const resetSent = searchParams.get("reset") === "sent";
  const authError = authErrorMessage(searchParams.get("error"));
  const prefilledEmail = searchParams.get("email")?.trim() ?? "";
  const prefilledPassword = searchParams.get("password") ?? "";

  useEffect(() => {
    if (!prefilledPassword) return;
    const url = new URL(window.location.href);
    url.searchParams.delete("password");
    window.history.replaceState({}, "", `${url.pathname}${url.search}${url.hash}`);
  }, [prefilledPassword]);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const email = String(fd.get("email") ?? "").trim();
    const password = String(fd.get("password") ?? "");

    setError(null);
    setFieldErrors({});

    const parsed = loginSchema.safeParse({ email, password });
    if (!parsed.success) {
      setFieldErrors(parsed.error.flatten().fieldErrors);
      return;
    }

    setPending(true);
    try {
      const res = await signIn("credentials", {
        email: parsed.data.email,
        password: parsed.data.password,
        redirect: false,
      });
      if (!res || res.ok !== true) {
        const code = res?.error ?? null;
        setError(
          authErrorMessage(code) ??
            "Не удалось войти. Проверьте email и пароль. После нескольких ошибок вход блокируется на 15 минут.",
        );
        return;
      }

      // Cookie сессии иногда появляется с задержкой — без ожидания getSession() пустой и редирект «не входит».
      router.refresh();
      let session = await getSession();
      for (let attempt = 0; attempt < 12 && !session?.user; attempt += 1) {
        await new Promise((resolve) => setTimeout(resolve, 100));
        session = await getSession();
      }

      if (!session?.user) {
        const fallback = safeCallbackUrl(searchParams.get("callbackUrl"));
        window.location.assign(fallback);
        return;
      }

      const role = session.user.role;
      const emailVerified = Boolean(session.user.emailVerified);
      if (role === "ADMIN") {
        window.location.assign("/admin");
        return;
      }
      if (role === "USER" && !emailVerified) {
        const verifyDest = safeCallbackUrl(searchParams.get("callbackUrl"));
        window.location.assign(
          `/auth/verify-email?verify_sent=1&callbackUrl=${encodeURIComponent(verifyDest)}`,
        );
        return;
      }
      window.location.assign(safeCallbackUrl(searchParams.get("callbackUrl")));
    } finally {
      setPending(false);
    }
  }

  const formLevelError = error && !fieldErrors.email && !fieldErrors.password;

  return (
    <AuthGlassCard
      title="Вход"
      description="Email и пароль — доступ к курсу, лабораториям и AI-наставнику."
      footer={
        <AuthFormFooter>
          Нет аккаунта?{" "}
          <Link className="font-semibold text-primary underline-offset-4 hover:underline" href="/auth/register">
            Регистрация
          </Link>
        </AuthFormFooter>
      }
    >
      {verifySent ? <AuthVerifySentBanner /> : null}
      {registered ? (
        <FormMessage variant="success">
          Регистрация прошла успешно. Войдите с теми же данными — мы уже отправили письмо для подтверждения
          email.
        </FormMessage>
      ) : null}
      {resetSent ? (
        <FormMessage variant="success">
          Если аккаунт с таким email существует, мы отправим инструкции по сбросу пароля.
        </FormMessage>
      ) : null}
      {authError ? <FormMessage variant="error">{authError}</FormMessage> : null}
      <AuthDevCredentialsHint />

      <form onSubmit={onSubmit} className="space-y-4" noValidate>
        {formLevelError ? <FormMessage id={formErrorId}>{error}</FormMessage> : null}
        <Input
          autoComplete="email"
          label="Email"
          name="email"
          type="email"
          placeholder="name@example.ru"
          defaultValue={prefilledEmail}
          required
          disabled={pending}
          error={fieldErrors.email?.[0]}
          aria-invalid={fieldErrors.email?.[0] || formLevelError ? true : undefined}
          aria-describedby={formLevelError ? formErrorId : undefined}
        />
        <div className="space-y-2">
          <PasswordInput
            autoComplete="current-password"
            label="Пароль"
            name="password"
            defaultValue={prefilledPassword}
            required
            disabled={pending}
            error={fieldErrors.password?.[0]}
            aria-invalid={fieldErrors.password?.[0] || formLevelError ? true : undefined}
            aria-describedby={formLevelError ? formErrorId : undefined}
          />
          <div className="flex justify-end">
            <Link
              href="/auth/forgot-password"
              className="inline-flex min-h-11 items-center text-sm font-medium text-primary underline-offset-4 hover:underline"
            >
              Забыли пароль?
            </Link>
          </div>
        </div>
        <Button className="w-full" size="lg" type="submit" loading={pending} disabled={pending}>
          Войти
        </Button>
      </form>
    </AuthGlassCard>
  );
}
