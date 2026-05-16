"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { moveQuestionAction, deleteQuestionAction } from "@/lib/actions/admin-tests";
import { Button } from "@/components/ui/button";

export function AdminTestQuestionMoveButtons({
  testId,
  questionId,
  canUp,
  canDown,
}: {
  testId: string;
  questionId: string;
  canUp: boolean;
  canDown: boolean;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function run(dir: "up" | "down") {
    startTransition(async () => {
      await moveQuestionAction(testId, questionId, dir);
      router.refresh();
    });
  }

  return (
    <div className="flex gap-1">
      <Button
        type="button"
        variant="outline"
        size="icon"
        disabled={!canUp || pending}
        title="Выше"
        aria-label="Переместить вопрос выше"
        onClick={() => run("up")}
      >
        ↑
      </Button>
      <Button
        type="button"
        variant="outline"
        size="icon"
        disabled={!canDown || pending}
        title="Ниже"
        aria-label="Переместить вопрос ниже"
        onClick={() => run("down")}
      >
        ↓
      </Button>
    </div>
  );
}

export function AdminTestDeleteQuestionButton({
  testId,
  questionId,
}: {
  testId: string;
  questionId: string;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  return (
    <Button
      type="button"
      variant="danger"
      size="sm"
      disabled={pending}
      loading={pending}
      onClick={() => {
        if (!window.confirm("Удалить вопрос и все варианты ответов?")) return;
        startTransition(async () => {
          await deleteQuestionAction(questionId, testId);
          router.refresh();
        });
      }}
    >
      Удалить вопрос
    </Button>
  );
}
