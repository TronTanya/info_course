"use client";

import { useActionState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { submitUserReviewAction, type UserReviewFormState } from "@/lib/actions/review-submit";

const initialState: UserReviewFormState = {};

export function DashboardReviewForm() {
  const [state, formAction, pending] = useActionState(submitUserReviewAction, initialState);

  if (state.success) {
    return (
      <div className="rounded-xl border border-success/30 bg-success/10 px-4 py-3 text-sm text-foreground">
        Спасибо! Отзыв отправлен на модерацию. После публикации он появится на главной странице и в разделе «Отзывы».
      </div>
    );
  }

  return (
    <form action={formAction} className="space-y-4">
      {state.error ? <p className="text-sm text-danger">{state.error}</p> : null}
      <div className="space-y-2">
        <label htmlFor="review-rating" className="text-sm font-medium text-foreground">
          Оценка (1–5)
        </label>
        <select
          id="review-rating"
          name="rating"
          required
          className="h-10 w-full max-w-xs rounded-xl border border-border bg-background px-3 text-sm text-foreground shadow-sm"
          defaultValue="5"
        >
          {[5, 4, 3, 2, 1].map((n) => (
            <option key={n} value={n}>
              {n}
            </option>
          ))}
        </select>
      </div>
      <div className="space-y-2">
        <label htmlFor="review-text" className="text-sm font-medium text-foreground">
          Текст отзыва
        </label>
        <textarea
          id="review-text"
          name="text"
          required
          rows={6}
          minLength={10}
          maxLength={4000}
          placeholder="Расскажите, что понравилось и что можно улучшить."
          className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm text-foreground shadow-sm placeholder:text-muted-foreground"
        />
        <p className="text-xs text-muted-foreground">Имя и учебное заведение подставятся из вашего профиля.</p>
      </div>
      <div className="flex flex-wrap gap-3">
        <Button type="submit" variant="primary" disabled={pending}>
          {pending ? "Отправка…" : "Отправить на модерацию"}
        </Button>
        <Button type="button" variant="outline" asChild>
          <Link href="/dashboard/settings">Редактировать профиль</Link>
        </Button>
      </div>
    </form>
  );
}
