"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { AuthCard } from "@/components/auth/auth-card";
import { Button } from "@/components/ui/button";
import { FormMessage } from "@/components/ui/form-message";
import { Input } from "@/components/ui/input";
import type { RegisterActionState } from "@/lib/actions/register";
import { registerAction } from "@/lib/actions/register";

export function RegisterForm() {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [state, setState] = useState<RegisterActionState>({});

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const fd = new FormData(form);
    const password = String(fd.get("password") ?? "");
    setPending(true);
    setState({});
    try {
      const result = await registerAction({}, fd);
      if (result.errors && Object.keys(result.errors).length > 0) {
        setState(result);
        return;
      }
      if (result.ok && result.email) {
        const res = await signIn("credentials", {
          email: result.email,
          password,
          redirect: false,
        });
        if (!res || res.ok !== true) {
          setState({ errors: { _form: ["Аккаунт создан, но вход не удался. Войдите вручную."] } });
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

  return (
    <AuthCard title="Регистрация" description="Создайте учётную запись и заполните профиль в кабинете.">
      <form onSubmit={onSubmit} className="space-y-4">
        {state.errors?._form ? <FormMessage>{state.errors._form[0]}</FormMessage> : null}
        <Input
          autoComplete="email"
          label="Email"
          name="email"
          type="email"
          placeholder="you@example.com"
          required
          error={state.errors?.email?.[0]}
          disabled={pending}
        />
        <Input
          autoComplete="new-password"
          label="Пароль"
          name="password"
          type="password"
          hint="Минимум 8 символов, буквы и цифры"
          required
          error={state.errors?.password?.[0]}
          disabled={pending}
        />
        <Input
          autoComplete="new-password"
          label="Подтверждение пароля"
          name="confirmPassword"
          type="password"
          required
          error={state.errors?.confirmPassword?.[0]}
          disabled={pending}
        />
        <label className="flex cursor-pointer items-start gap-3 text-sm">
          <input
            type="checkbox"
            name="consent"
            className="mt-1 size-4 shrink-0 rounded border-border text-primary focus:ring-ring"
            disabled={pending}
          />
          <span className="text-muted-foreground">
            Я согласен на обработку персональных данных в соответствии с политикой платформы.
            {state.errors?.consent?.[0] ? <span className="mt-1 block text-danger">{state.errors.consent[0]}</span> : null}
          </span>
        </label>
        <Button className="w-full" type="submit" loading={pending}>
          Создать аккаунт
        </Button>
      </form>
      <p className="text-center text-sm text-muted-foreground">
        Уже есть аккаунт?{" "}
        <Link className="font-medium text-primary underline-offset-4 hover:underline" href="/auth/login">
          Вход
        </Link>
      </p>
    </AuthCard>
  );
}
