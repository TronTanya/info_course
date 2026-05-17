import { Suspense } from "react";
import { LoginForm } from "@/components/auth/login-form";
import { LoadingState } from "@/components/ui/loading-state";
import { buildPublicMetadata } from "@/lib/seo/build-page-metadata";

export const metadata = buildPublicMetadata({
  title: "Вход",
  description: "Войдите в CyberEdu — курс по основам информационной безопасности.",
  path: "/auth/login",
});

export default function LoginPage() {
  return (
    <Suspense fallback={<LoadingState size="sm" label="Загрузка формы входа…" />}>
      <LoginForm />
    </Suspense>
  );
}
