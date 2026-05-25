"use client";

import { AnimatePresence, motion } from "framer-motion";
import type { PracticeLabState } from "@/lib/practice-lab-ui";
import { practiceLabStateMeta } from "@/lib/practice-lab-ui";
import { AnswerFeedback } from "@/components/ui/answer-feedback";
import { Alert } from "@/components/ui/alert";
import { classifyFormFeedback } from "@/lib/form-feedback";
import { resolvePracticeClientErrorDisplay } from "@/lib/practice-page-state";
import { cn } from "@/lib/utils";

const stateShell: Record<PracticeLabState, string> = {
  not_started: "border-border/60",
  in_progress: "border-primary/30 ring-primary/15",
  submitted: "border-warning/35 bg-warning/[0.06] ring-warning/20",
  passed: "border-success/40 bg-success/[0.08] ring-success/25",
  needs_review: "border-warning/40 bg-warning/[0.08] ring-warning/25",
  wrong: "border-danger/40 bg-danger/[0.06] ring-danger/25 ce-practice-result--wrong",
  correct: "border-success/40 bg-success/[0.08] ring-success/25 ce-practice-result--correct",
};

export function PracticeLabResult({
  labState,
  error,
  info,
  needsRevision,
  revisionComment,
  accepted,
  showIntro,
  pendingReview,
}: {
  labState: PracticeLabState;
  error: string | null;
  info: string | null;
  needsRevision: boolean;
  revisionComment?: string | null;
  accepted: boolean;
  showIntro: boolean;
  pendingReview: boolean;
}) {
  const meta = practiceLabStateMeta[labState];

  return (
    <div className="space-y-3">
      <AnimatePresence mode="popLayout">
        <motion.div
          key={labState}
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          className={cn(
            "rounded-xl border px-4 py-3 ring-1 ring-inset motion-reduce:transition-none",
            stateShell[labState],
          )}
          role="status"
          aria-live="polite"
        >
          <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">Статус лаборатории</p>
          <p
            className={cn(
              "mt-1 font-display text-sm font-semibold",
              labState === "wrong" && "text-danger",
              (labState === "correct" || labState === "passed") && "text-success",
              labState === "in_progress" && "text-primary",
              (labState === "submitted" || labState === "needs_review") && "text-warning",
            )}
          >
            {meta.label}
            {labState === "wrong" ? <span className="sr-only"> — требует исправления</span> : null}
            {labState === "correct" || labState === "passed" ? (
              <span className="sr-only"> — зачтено</span>
            ) : null}
            {labState === "submitted" || labState === "needs_review" ? (
              <span className="sr-only"> — на проверке</span>
            ) : null}
          </p>
        </motion.div>

        {needsRevision ? (
          <motion.div key="revision" initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }}>
            <Alert variant="warning" title="Нужны правки">
              {revisionComment?.trim() ? revisionComment.trim() : "Учтите замечания и отправьте ответ снова."}
            </Alert>
          </motion.div>
        ) : null}

        {error ? (
          <motion.div
            key="err"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="ce-practice-result--wrong"
          >
            {(() => {
              const safeError = resolvePracticeClientErrorDisplay(error).message;
              const fb = classifyFormFeedback(safeError);
              if (labState === "wrong" && fb.kind !== "rate_limit" && fb.kind !== "unavailable") {
                return (
                  <AnswerFeedback
                    variant="incorrect"
                    title="Ответ не засчитан"
                    explanation={fb.description ?? safeError}
                  />
                );
              }
              const variant = fb.kind === "rate_limit" || fb.kind === "unavailable" ? "warning" : "danger";
              return (
                <Alert variant={variant} title={fb.title}>
                  {fb.description ?? safeError}
                </Alert>
              );
            })()}
          </motion.div>
        ) : null}

        {info ? (
          <motion.div
            key="ok"
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className={cn(labState === "correct" && "ce-practice-result--correct")}
          >
            <Alert variant="success" title={labState === "correct" ? "Ответ верный" : "Результат проверки"}>
              {info}
            </Alert>
          </motion.div>
        ) : null}

        {accepted ? (
          <motion.div key="accepted" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
            <Alert variant="success" title="Лабораторная работа завершена">
              Задание принято. Вернитесь к модулю и продолжите программу.
            </Alert>
          </motion.div>
        ) : null}

        {showIntro ? (
          <motion.div key="intro" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <Alert variant="info" title="Добро пожаловать в Cyber Lab">
              <ol className="mt-2 list-decimal space-y-1 pl-5 text-sm">
                <li>Прочитайте карточку сценария — роль, задача и исходные данные.</li>
                <li>Откройте блок «Как оценивается ответ» и при необходимости подсказки.</li>
                <li>Выполните задание в рабочей области и отправьте ответ — проверка на сервере.</li>
                <li>После отправки следите за статусом и переходите к следующему шагу курса.</li>
              </ol>
            </Alert>
          </motion.div>
        ) : null}

        {pendingReview && !accepted ? (
          <motion.div key="pending" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <Alert variant="warning" title="Отправлено на проверку">
              Ответ принят системой. Новая попытка станет доступна после решения преподавателя.
            </Alert>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
