"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { CheckCircle2 } from "lucide-react";
import { signIn } from "next-auth/react";
import { AuthFormFooter } from "@/components/auth/auth-form-footer";
import { AuthGlassCard } from "@/components/auth/auth-glass-card";
import { PasswordInput } from "@/components/auth/password-input";
import { Button } from "@/components/ui/button";
import { FormMessage } from "@/components/ui/form-message";
import { Input } from "@/components/ui/input";
import type { RegisterActionState } from "@/lib/actions/register";
import { registerAction } from "@/lib/actions/register";

export function RegisterForm() {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [state, setState] = useState<RegisterActionState>({});
  const [success, setSuccess] = useState(false);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const fd = new FormData(form);
    const password = String(fd.get("password") ?? "");
    setPending(true);
    setState({});
    setSuccess(false);
    try {
      const result = await registerAction({}, fd);
      if (result.errors && Object.keys(result.errors).length > 0) {
        setState(result);
        return;
      }
      if (result.ok && result.email) {
        setSuccess(true);
        const res = await signIn("credentials", {
          email: result.email,
          password,
          redirect: false,
        });
        if (!res || res.ok !== true) {
          router.push("/auth/login?registered=1");
          return;
        }
        router.refresh();
        router.push("/dashboard/profile");
      }
    } finally {
      setPending(false);
    }
  }

  if (success) {
    return (
      <AuthGlassCard title="Аккаунт создан" description="Выполняется вход в защищённую сессию…">
        <div className="flex flex-col items-center gap-4 py-4 text-center" role="status">
          <span className="flex size-14 items-center justify-center rounded-2xl border border-success/35 bg-success/12 text-success">
            <CheckCircle2 className="size-8" aria-hidden />
          </span>
          <p className="text-sm text-muted-foreground">Перенаправляем в личный кабинет…</p>
        </div>
      </AuthGlassCard>
    );
  }

  return (
    <AuthGlassCard
      title="Регистрация"
      description="Создайте учётную запись и начните модульный курс."
      footer={
        <AuthFormFooter>
          Уже есть аккаунт?{" "}
          <Link className="font-semibold text-primary underline-offset-4 hover:underline" href="/auth/login">
            Войти
          </Link>
        </AuthFormFooter>
      }
    >
      <form onSubmit={onSubmit} className="space-y-4" noValidate>
        {state.errors?._form ? <FormMessage>{state.errors._form[0]}</FormMessage> : null}
        <Input
          autoComplete="name"
          label="Имя"
          name="name"
          type="text"
          placeholder="Иван Иванов"
          required
          error={state.errors?.name?.[0]}
          disabled={pending}
        />
        <Input
          autoComplete="email"
          label="Email"
          name="email"
          type="email"
          placeholder="name@example.ru"
          required
          error={state.errors?.email?.[0]}
          disabled={pending}
        />
        <PasswordInput
          autoComplete="new-password"
          label="Пароль"
          name="password"
          hint="Минимум 8 символов, буквы и цифры"
          required
          error={state.errors?.password?.[0]}
          disabled={pending}
        />
        <PasswordInput
          autoComplete="new-password"
          label="Подтверждение пароля"
          name="confirmPassword"
          required
          error={state.errors?.confirmPassword?.[0]}
          disabled={pending}
        />
        <label className="flex min-h-11 cursor-pointer items-start gap-3 text-sm">
          <input
            type="checkbox"
            name="consent"
            className="mt-1 size-4 shrink-0 rounded border-border text-primary focus-visible:ring-2 focus-visible:ring-primary/50"
            disabled={pending}
            required
          />
          <span className="text-muted-foreground">
            Я согласен на обработку персональных данных в соответствии с политикой платформы.
            {state.errors?.consent?.[0] ? (
              <span className="mt-1 block text-sm text-danger" role="alert">
                {state.errors.consent[0]}
              </span>
            ) : null}
          </span>
        </label>
        <Button className="w-full" size="lg" type="submit" loading={pending} disabled={pending}>
          Создать аккаунт
        </Button>
      </form>
    </AuthGlassCard>
  );
}
