"use client";

import { useActionState, useState } from "react";
import {
  addAnswerAction,
  deleteAnswerAction,
  updateAnswerAction,
  updateQuestionAction,
  type AdminTestFormState,
} from "@/lib/actions/admin-tests";
import { AdminTestDeleteQuestionButton, AdminTestQuestionMoveButtons } from "@/components/admin/admin-test-question-controls";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import type { QuestionType } from "@prisma/client";

export type AdminQuestionPayload = {
  id: string;
  questionText: string;
  questionType: QuestionType;
  points: number;
  orderNumber: number;
  textExpectedAnswer: string | null;
  textManualGrading: boolean;
  answers: { id: string; answerText: string; isCorrect: boolean }[];
};

export function AdminTestQuestionCard({
  testId,
  question,
  positionLabel,
  canUp,
  canDown,
  questionCount,
}: {
  testId: string;
  question: AdminQuestionPayload;
  positionLabel: number;
  canUp: boolean;
  canDown: boolean;
  questionCount: number;
}) {
  const [qState, qFormAction, qPending] = useActionState<AdminTestFormState | null, FormData>(
    updateQuestionAction,
    null,
  );

  const [localType, setLocalType] = useState<QuestionType>(question.questionType);
  const isText = localType === "TEXT";

  return (
    <div className="rounded-2xl border border-border bg-card p-4 shadow-card">
      <div className="flex flex-wrap items-start justify-between gap-3 border-b border-border pb-3">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Вопрос · порядок {question.orderNumber}
          </p>
          <p className="mt-1 text-sm text-muted-foreground">Позиция в форме: {positionLabel} из {questionCount}</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <AdminTestQuestionMoveButtons testId={testId} questionId={question.id} canUp={canUp} canDown={canDown} />
          <AdminTestDeleteQuestionButton testId={testId} questionId={question.id} />
        </div>
      </div>

      <form action={qFormAction} className="mt-4 space-y-4">
        <input type="hidden" name="questionId" value={question.id} />
        <input type="hidden" name="testId" value={testId} />
        {qState?.error ? (
          <Alert variant="danger" title="Ошибка сохранения вопроса">
            {qState.error}
          </Alert>
        ) : null}
        <Textarea
          name="questionText"
          label="Текст вопроса"
          required
          rows={3}
          defaultValue={question.questionText}
          disabled={qPending}
        />
        <div className="grid gap-4 sm:grid-cols-2">
          <Select
            name="questionType"
            label="Тип"
            required
            value={localType}
            onChange={(e) => setLocalType(e.target.value as QuestionType)}
            disabled={qPending}
          >
            <option value="SINGLE_CHOICE">Один верный вариант</option>
            <option value="MULTIPLE_CHOICE">Несколько верных</option>
            <option value="TRUE_FALSE">Верно / неверно</option>
            <option value="TEXT">Текстовый ответ</option>
          </Select>
          <Input
            name="points"
            type="number"
            min={1}
            label="Баллы за вопрос"
            defaultValue={String(question.points)}
            disabled={qPending}
          />
        </div>
        <Input
          name="orderPosition"
          type="number"
          min={1}
          max={questionCount}
          label="Позиция в тесте"
          hint={`От 1 до ${questionCount}`}
          defaultValue={String(positionLabel)}
          disabled={qPending}
        />

        {isText ? (
          <div className="space-y-3 rounded-xl border border-border bg-muted/20 p-3">
            <p className="text-sm font-medium text-foreground">Текстовый вопрос</p>
            <p className="text-xs text-muted-foreground">
              Студентам не показываются варианты и эталон ответа. Проверка — на сервере.
            </p>
            <Textarea
              name="textExpectedAnswer"
              label="Пример правильного ответа (для автоматического сравнения)"
              rows={3}
              defaultValue={question.textExpectedAnswer ?? ""}
              disabled={qPending}
              hint="Сравнение без учёта регистра и лишних пробелов. Не используется, если включена только ручная проверка."
            />
            <label className="flex cursor-pointer items-center gap-2 text-sm text-foreground">
              <input
                type="checkbox"
                name="textManualGrading"
                defaultChecked={question.textManualGrading}
                className="size-4 rounded border-border"
                disabled={qPending}
              />
              Только ручная проверка (балл не входит в автоматический проходной порог)
            </label>
          </div>
        ) : null}

        <Button type="submit" size="sm" loading={qPending}>
          Сохранить вопрос
        </Button>
      </form>

      {!isText ? (
        <div className="mt-6 space-y-3 border-t border-border pt-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-sm font-medium text-foreground">Варианты ответов</p>
            <form action={addAnswerAction.bind(null, testId, question.id)}>
              <Button type="submit" variant="outline" size="sm">
                Добавить вариант
              </Button>
            </form>
          </div>
          <ul className="space-y-3">
            {question.answers.map((a) => (
              <li
                key={a.id}
                className="flex flex-col gap-2 rounded-xl border border-border bg-muted/15 p-3 sm:flex-row sm:items-start"
              >
                <form action={updateAnswerAction} className="min-w-0 flex-1 space-y-2">
                  <input type="hidden" name="answerId" value={a.id} />
                  <input type="hidden" name="testId" value={testId} />
                  <input type="hidden" name="questionId" value={question.id} />
                  <Input name="answerText" label="Текст варианта" defaultValue={a.answerText} required />
                  <label className="flex cursor-pointer items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      name="isCorrect"
                      defaultChecked={a.isCorrect}
                      className="size-4 rounded border-border"
                    />
                    Правильный ответ
                  </label>
                  <Button type="submit" variant="secondary" size="sm">
                    Сохранить вариант
                  </Button>
                </form>
                <form action={deleteAnswerAction.bind(null, a.id, testId, question.id)} className="shrink-0">
                  <Button type="submit" variant="ghost" size="sm" className="text-danger hover:text-danger">
                    Удалить
                  </Button>
                </form>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}
