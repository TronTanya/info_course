"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { getSession, signIn } from "next-auth/react";
import { AuthCard } from "@/components/auth/auth-card";
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
      // Auth.js при redirect:false может положить `error` из query в `url`; надёжнее смотреть `ok` (HTTP + факт входа).
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

  const registered = searchParams.get("registered") === "1";

  return (
    <AuthCard title="Вход" description="Введите email и пароль учётной записи.">
      {registered ? (
        <FormMessage variant="success">Регистрация прошла успешно. Войдите с теми же данными.</FormMessage>
      ) : null}
      <form onSubmit={onSubmit} className="space-y-3" noValidate>
        {error ? <FormMessage>{error}</FormMessage> : null}
        <Input autoComplete="email" label="Email" name="email" type="email" placeholder="name@example.ru" required disabled={pending} />
        <Input autoComplete="current-password" label="Пароль" name="password" type="password" required disabled={pending} />
        <Button className="w-full" type="submit" loading={pending}>
          Войти
        </Button>
      </form>
      <p className="text-center text-sm text-muted-foreground">
        Нет аккаунта?{" "}
        <Link className="font-medium text-primary underline-offset-4 hover:underline" href="/auth/register">
          Регистрация
        </Link>
      </p>
    </AuthCard>
  );
}
