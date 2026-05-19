"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { getSession, signIn } from "next-auth/react";
import { AuthFormFooter } from "@/components/auth/auth-form-footer";
import { AuthGlassCard } from "@/components/auth/auth-glass-card";
import { PasswordInput } from "@/components/auth/password-input";
import { Button } from "@/components/ui/button";
import { FormMessage } from "@/components/ui/form-message";
import { Input } from "@/components/ui/input";

function safeCallbackUrl(raw: string | null): string | null {
  if (!raw || !raw.startsWith("/") || raw.startsWith("//")) return null;
  return raw;
}

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const registered = searchParams.get("registered") === "1";
  const resetSent = searchParams.get("reset") === "sent";

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const email = String(fd.get("email") ?? "").trim();
    const password = String(fd.get("password") ?? "");
    setPending(true);
    setError(null);
    try {
      const res = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });
      if (!res || res.ok !== true) {
        setError("Не удалось войти. Проверьте email и пароль или зарегистрируйте новый аккаунт.");
        return;
      }
      const session = await getSession();
      const role = session?.user?.role;
      if (role === "ADMIN") {
        router.refresh();
        router.push("/admin");
        return;
      }
      let dest = safeCallbackUrl(searchParams.get("callbackUrl")) ?? "/dashboard/profile";
      if (dest.startsWith("/admin")) {
        dest = "/dashboard/profile";
      }
      router.refresh();
      router.push(dest);
    } finally {
      setPending(false);
    }
  }

  return (
    <AuthGlassCard
      title="Вход"
      description="Войдите в защищённую сессию CyberEdu."
      footer={
        <AuthFormFooter>
          Нет аккаунта?{" "}
          <Link className="font-semibold text-primary underline-offset-4 hover:underline" href="/auth/register">
            Регистрация
          </Link>
        </AuthFormFooter>
      }
    >
      {registered ? (
        <FormMessage variant="success">Регистрация прошла успешно. Войдите с теми же данными.</FormMessage>
      ) : null}
      {resetSent ? (
        <FormMessage variant="success">
          Если аккаунт с таким email существует, мы отправим инструкции по сбросу пароля.
        </FormMessage>
      ) : null}

      <form onSubmit={onSubmit} className="space-y-4" noValidate>
        {error ? <FormMessage>{error}</FormMessage> : null}
        <Input
          autoComplete="email"
          label="Email"
          name="email"
          type="email"
          placeholder="name@example.ru"
          required
          disabled={pending}
        />
        <div className="space-y-2">
          <PasswordInput
            autoComplete="current-password"
            label="Пароль"
            name="password"
            required
            disabled={pending}
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
