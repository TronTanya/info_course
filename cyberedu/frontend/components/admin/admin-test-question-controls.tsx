"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { AdminConfirmDialog } from "@/components/admin/admin-confirm-dialog";
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
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();

  return (
    <>
      <Button
        type="button"
        variant="danger"
        size="sm"
        disabled={pending}
        onClick={() => setOpen(true)}
      >
        Удалить вопрос
      </Button>
      <AdminConfirmDialog
        open={open}
        onOpenChange={setOpen}
        title="Удалить вопрос?"
        description="Будут удалены вопрос и все варианты ответов. Действие необратимо."
        confirmLabel="Удалить"
        loading={pending}
        onConfirm={() => {
          startTransition(async () => {
            await deleteQuestionAction(questionId, testId);
            setOpen(false);
            router.refresh();
          });
        }}
      />
    </>
  );
}
