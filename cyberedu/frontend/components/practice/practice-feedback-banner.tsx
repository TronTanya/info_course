"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Alert } from "@/components/ui/alert";
import { classifyFormFeedback } from "@/lib/form-feedback";

const fade = (reduce: boolean | null) =>
  reduce
    ? { initial: false as const, animate: { opacity: 1 }, exit: { opacity: 0 }, transition: { duration: 0 } }
    : { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 } };

export function PracticeFeedbackBanner({
  error,
  info,
  needsRevision,
  revisionComment,
  accepted,
  showIntro,
}: {
  error: string | null;
  info: string | null;
  needsRevision: boolean;
  revisionComment?: string | null;
  accepted: boolean;
  showIntro: boolean;
}) {
  const reduce = useReducedMotion();

  return (
    <AnimatePresence mode="popLayout">
      {needsRevision ? (
        <motion.div
          key="revision"
          {...(reduce
            ? fade(reduce)
            : { initial: { opacity: 0, y: -8 }, animate: { opacity: 1, y: 0 }, exit: { opacity: 0 } })}
        >
          <Alert variant="warning" title="Работа на доработке">
            {revisionComment?.trim() ? revisionComment.trim() : "Учтите замечания проверяющего и отправьте работу снова."}
          </Alert>
        </motion.div>
      ) : null}
      {error ? (
        <motion.div
          key="err"
          {...(reduce
            ? fade(reduce)
            : { initial: { opacity: 0, x: -8 }, animate: { opacity: 1, x: 0 }, exit: { opacity: 0 } })}
        >
          {(() => {
            const fb = classifyFormFeedback(error);
            const variant =
              fb.kind === "rate_limit" || fb.kind === "unavailable" ? "warning" : "danger";
            return (
              <Alert variant={variant} title={fb.title}>
                {fb.description}
              </Alert>
            );
          })()}
        </motion.div>
      ) : null}
      {info ? (
        <motion.div
          key="ok"
          {...(reduce
            ? fade(reduce)
            : { initial: { opacity: 0, scale: 0.98 }, animate: { opacity: 1, scale: 1 }, exit: { opacity: 0 } })}
          className="motion-reduce:animate-none motion-safe:animate-[ce-fade-in-up_0.4s_ease-out]"
        >
          <Alert variant="success" title="Отправлено">
            {info}
          </Alert>
        </motion.div>
      ) : null}
      {accepted ? (
        <motion.div
          key="accepted"
          {...(reduce
            ? fade(reduce)
            : { initial: { opacity: 0, y: 8 }, animate: { opacity: 1, y: 0 }, exit: { opacity: 0 } })}
        >
          <Alert variant="success" title="Практика принята">
            Следующий шаг модуля доступен. Вернитесь к модулю, чтобы продолжить программу.
          </Alert>
        </motion.div>
      ) : null}
      {showIntro ? (
        <motion.div key="intro" {...fade(reduce)}>
          <Alert variant="info" title="Как сдать практику">
            Выполните задание в рабочей области ниже и отправьте ответ или файлы — в зависимости от типа задания.
          </Alert>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
