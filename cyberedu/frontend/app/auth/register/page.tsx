import { RegisterForm } from "@/components/auth/register-form";
import { buildPublicMetadata } from "@/lib/seo/build-page-metadata";

export const metadata = buildPublicMetadata({
  title: "Регистрация",
  description: "Создайте аккаунт CyberEdu и начните модульный курс по информационной безопасности.",
  path: "/auth/register",
});

export default function RegisterPage() {
  return <RegisterForm />;
}
