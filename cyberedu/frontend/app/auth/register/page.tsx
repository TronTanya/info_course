import { Suspense } from "react";
import { RegisterForm } from "@/components/auth/register-form";
import { LoadingState } from "@/components/ui/loading-state";
import { buildPublicMetadata } from "@/lib/seo/build-page-metadata";

export const metadata = buildPublicMetadata({
  title: "Регистрация",
  description: "Создайте аккаунт CyberEdu и начните модульный курс по информационной безопасности.",
  path: "/auth/register",
});

export default function RegisterPage() {
  return (
    <Suspense fallback={<LoadingState size="sm" label="Загрузка формы регистрации…" />}>
      <RegisterForm />
    </Suspense>
  );
}
