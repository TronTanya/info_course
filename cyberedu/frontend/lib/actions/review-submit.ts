"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { createUserReviewRecord } from "@/lib/reviews";
import { userReviewSubmitSchema } from "@/lib/validation";

export type UserReviewFormState = {
  error?: string;
  success?: boolean;
};

export async function submitUserReviewAction(
  _prev: UserReviewFormState,
  formData: FormData,
): Promise<UserReviewFormState> {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/auth/login");
  }

  const parsed = userReviewSubmitSchema.safeParse({
    rating: formData.get("rating"),
    text: formData.get("text"),
  });
  if (!parsed.success) {
    const msg = parsed.error.flatten().fieldErrors.text?.[0] ?? parsed.error.flatten().fieldErrors.rating?.[0];
    return { error: msg ?? "Проверьте поля формы." };
  }

  const result = await createUserReviewRecord(session.user.id, parsed.data);
  if (!result.ok) {
    switch (result.code) {
      case "NO_PROFILE":
        return { error: "Заполните профиль, чтобы оставить отзыв." };
      case "NO_ELIGIBILITY":
        return { error: "Отзыв доступен после завершения хотя бы одного модуля курса." };
      case "ALREADY_EXISTS":
      case "DUPLICATE":
        return { error: "Вы уже отправили отзыв." };
      default:
        return { error: "Не удалось сохранить отзыв." };
    }
  }

  revalidatePath("/");
  revalidatePath("/reviews");
  revalidatePath("/dashboard/reviews");
  return { success: true };
}
