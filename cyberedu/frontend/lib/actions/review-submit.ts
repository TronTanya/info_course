"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { createUserReviewRecord } from "@/lib/reviews";
import { enforceRateLimit, RATE_LIMIT_POLICIES } from "@/lib/security/rate-limit";
import { clientIpFromHeaders } from "@/lib/security/request-ip";
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

  const h = await headers();
  const ip = clientIpFromHeaders(h);
  const reviewPolicy = RATE_LIMIT_POLICIES.reviewSubmit;
  const rl = await enforceRateLimit({
    scope: reviewPolicy.scope,
    userId: session.user.id,
    clientIp: ip,
    max: reviewPolicy.max,
    windowMs: reviewPolicy.windowMs,
  });
  if (!rl.allowed) {
    return {
      error:
        rl.reason === "unavailable"
          ? "Сервис временно недоступен. Повторите позже."
          : "Слишком много попыток отправить отзыв. Попробуйте позже.",
    };
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
