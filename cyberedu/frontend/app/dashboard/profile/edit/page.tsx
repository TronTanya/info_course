import { redirect } from "next/navigation";

/** Редактирование профиля перенесено на страницу настроек. */
export default function ProfileEditRedirectPage() {
  redirect("/dashboard/settings");
}
