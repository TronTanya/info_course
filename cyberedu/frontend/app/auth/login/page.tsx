import type { Metadata } from "next";
import { Suspense } from "react";
import { LoginForm } from "@/components/auth/login-form";

export const metadata: Metadata = {
  title: "Вход",
};

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="text-sm text-muted-foreground">Загрузка…</div>}>
      <LoginForm />
    </Suspense>
  );
}
