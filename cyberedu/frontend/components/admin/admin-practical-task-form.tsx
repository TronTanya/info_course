"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import type { CheckType, PracticalTaskType } from "@prisma/client";
import { savePracticalTaskAction, type AdminPracticalFormState } from "@/lib/actions/admin-practical-tasks";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { allowedTypesHuman, PRACTICE_ALLOWED_EXTENSIONS } from "@/lib/practice-file-constants";

export type ModuleOption = { id: string; title: string; orderNumber: number };

export type PracticalTaskInitial = {
  id: string;
  moduleId: string;
  title: string;
  description: string;
  taskType: PracticalTaskType;
  checkType: CheckType;
  maxScore: number;
  minLength: number;
  expectedCommand: string | null;
  expectedAnswerPattern: string | null;
  interactiveExpectedAnswer: string | null;
  consoleScenario: string | null;
  allowedFileTypes: string | null;
  maxFileSizeMb: number | null;
  instruction: string | null;
  /** Отформатированный JSON для поля админки */
  scenarioData?: string | null;
};

const DEFAULT_EXT_HINT = allowedTypesHuman([...PRACTICE_ALLOWED_EXTENSIONS]);

const STRUCTURED_SCENARIO_TYPES = new Set<PracticalTaskType>([
  "SITUATION_CHOICE",
  "PASSWORD_ANALYSIS",
  "PHISHING_ANALYSIS",
  "CHECKLIST",
  "URL_ANALYSIS",
  "CRYPTO_TASK",
  "LOG_ANALYSIS",
]);

export function AdminPracticalTaskForm({
  modules,
  initial,
}: {
  modules: ModuleOption[];
  initial?: PracticalTaskInitial | null;
}) {
  const [state, formAction, pending] = useActionState<AdminPracticalFormState | null, FormData>(
    savePracticalTaskAction,
    null,
  );

  const [taskType, setTaskType] = useState<PracticalTaskType>(initial?.taskType ?? "TEXT_ANSWER");

  const firstModuleId = modules[0]?.id ?? "";

  return (
    <form action={formAction} className="mx-auto max-w-3xl space-y-8">
      {initial?.id ? <input type="hidden" name="taskId" value={initial.id} /> : null}

      {state?.error ? (
        <Alert variant="danger" title="Ошибка">
          {state.error}
        </Alert>
      ) : null}

      <div className="space-y-4 rounded-2xl border border-border bg-card p-4 shadow-card">
        <h2 className="text-sm font-semibold text-foreground">Основное</h2>
        <Select
          name="moduleId"
          label="Модуль"
          required
          disabled={pending || modules.length === 0}
          defaultValue={initial?.moduleId ?? firstModuleId}
        >
          {modules.map((m) => (
            <option key={m.id} value={m.id}>
              #{m.orderNumber} · {m.title}
            </option>
          ))}
        </Select>
        <Input
          name="title"
          label="Название"
          required
          defaultValue={initial?.title ?? ""}
          placeholder="Практическая работа"
          disabled={pending}
        />
        <Textarea
          name="description"
          label="Описание задания для студента"
          required
          rows={6}
          defaultValue={initial?.description ?? ""}
          disabled={pending}
        />
        <div className="grid gap-4 sm:grid-cols-2">
          <Select
            name="taskType"
            label="Тип задания"
            required
            value={taskType}
            onChange={(e) => setTaskType(e.target.value as PracticalTaskType)}
            disabled={pending}
          >
            <option value="TEXT_ANSWER">Текстовый ответ</option>
            <option value="FILE_UPLOAD">Загрузка файла</option>
            <option value="INTERACTIVE">Интерактив (консоль, legacy)</option>
            <option value="TRAINING_CONSOLE">Учебная консоль (симулятор)</option>
            <option value="COMBINED">Комбинированное</option>
            <option value="SITUATION_CHOICE">Ситуации и выбор</option>
            <option value="PASSWORD_ANALYSIS">Анализ паролей</option>
            <option value="PHISHING_ANALYSIS">Разбор фишинга</option>
            <option value="CHECKLIST">Чек-лист</option>
            <option value="URL_ANALYSIS">Анализ ссылок</option>
            <option value="CRYPTO_TASK">Криптография (учебно)</option>
            <option value="LOG_ANALYSIS">Анализ журнала</option>
          </Select>
          <Select name="checkType" label="Тип проверки" required defaultValue={initial?.checkType ?? "MANUAL"} disabled={pending}>
            <option value="AUTO">Автоматически</option>
            <option value="MANUAL">Вручную</option>
            <option value="MIXED">Смешанно</option>
          </Select>
        </div>
        <Input
          name="maxScore"
          type="number"
          min={0}
          label="Максимальный балл"
          defaultValue={String(initial?.maxScore ?? 20)}
          disabled={pending}
        />
      </div>

      {taskType === "INTERACTIVE" || taskType === "TRAINING_CONSOLE" ? (
        <div className="space-y-4 rounded-2xl border border-primary/25 bg-primary/5 p-4">
          <h2 className="text-sm font-semibold text-foreground">
            {taskType === "TRAINING_CONSOLE" ? "Учебная консоль" : "Интерактивное задание"}
          </h2>
          <p className="text-xs text-muted-foreground">
            Ожидаемая команда и regex для объяснения задают «структурированную» автопроверку. Поле «эталон (legacy)» — для старого сценария с кодовой фразой.
          </p>
          <Textarea
            name="consoleScenario"
            label="Сценарий / подсказки для консоли (видят студенты)"
            rows={4}
            defaultValue={initial?.consoleScenario ?? ""}
            disabled={pending}
            hint="Показывается над учебной консолью: шаги, что ввести, ожидаемый вывод."
          />
          <Input
            name="expectedCommand"
            label="Ожидаемая команда"
            defaultValue={initial?.expectedCommand ?? ""}
            disabled={pending}
            hint="Например: ping example.com — должна совпасть с записанной из симулятора командой."
          />
          <Textarea
            name="expectedAnswerPattern"
            label="Regex для проверки текстового объяснения"
            rows={2}
            defaultValue={initial?.expectedAnswerPattern ?? ""}
            disabled={pending}
            hint="Проверка с флагом i. Пусто — объяснение не требуется для авто-зачёта."
          />
          <Textarea
            name="interactiveExpectedAnswer"
            label="Эталон для legacy-режима (кодовая фраза)"
            rows={2}
            defaultValue={initial?.interactiveExpectedAnswer ?? ""}
            disabled={pending}
          />
          <div className="rounded-xl border border-border bg-card/80 p-3 text-xs text-muted-foreground">
            <p className="font-medium text-foreground">Минимальная длина текстов в интерактиве</p>
            <p className="mt-1">
              Для режима «только ручная проверка» и для пояснений используется поле ниже (общее с текстовыми заданиями).
            </p>
          </div>
          <Input
            name="minLength"
            type="number"
            min={1}
            max={50000}
            label="Мин. длина отчёта (ручной режим / пояснение к консоли)"
            defaultValue={String(initial?.minLength ?? 10)}
            disabled={pending}
          />
          <Textarea
            name="scenarioData"
            label="scenarioData (JSON, опционально — подсказки и критерии)"
            rows={8}
            defaultValue={initial?.scenarioData ?? ""}
            disabled={pending}
            className="font-mono text-xs"
            hint="Для типа «Учебная консоль» студент видит подсказки из JSON на странице практики."
          />
        </div>
      ) : null}

      {STRUCTURED_SCENARIO_TYPES.has(taskType) ? (
        <div className="space-y-4 rounded-2xl border border-primary/25 bg-primary/5 p-4">
          <h2 className="text-sm font-semibold text-foreground">Сценарий (структурированная практика)</h2>
          <p className="text-xs text-muted-foreground">
            JSON описывает подсказки, критерии и эталоны проверки. Неверный JSON не сохранится.
          </p>
          <Input
            name="minLength"
            type="number"
            min={1}
            max={50000}
            label="Мин. длина текстовых полей (где применимо)"
            defaultValue={String(initial?.minLength ?? 40)}
            disabled={pending}
          />
          <Textarea
            name="scenarioData"
            label="scenarioData (JSON)"
            rows={14}
            defaultValue={initial?.scenarioData ?? ""}
            disabled={pending}
            className="font-mono text-xs"
            hint="Пусто — null в БД. Формат должен соответствовать коду проверки на сервере."
          />
        </div>
      ) : null}

      {taskType === "FILE_UPLOAD" || taskType === "COMBINED" ? (
        <div className="space-y-4 rounded-2xl border border-primary/25 bg-primary/5 p-4">
          <h2 className="text-sm font-semibold text-foreground">Файл</h2>
          <Input
            name="allowedFileTypes"
            label="Разрешённые расширения"
            defaultValue={initial?.allowedFileTypes ?? ""}
            disabled={pending}
            placeholder="pdf, docx, txt, png, jpg, zip"
            hint={`Через запятую. Пусто — все стандартные: ${DEFAULT_EXT_HINT}.`}
          />
          <Input
            name="maxFileSizeMb"
            type="number"
            min={1}
            max={100}
            label="Макс. размер файла (МБ)"
            defaultValue={initial?.maxFileSizeMb != null ? String(initial.maxFileSizeMb) : ""}
            disabled={pending}
            hint="Пусто — 10 МБ по умолчанию."
          />
        </div>
      ) : null}

      {taskType === "TEXT_ANSWER" || taskType === "COMBINED" ? (
        <div className="space-y-4 rounded-2xl border border-primary/25 bg-primary/5 p-4">
          <h2 className="text-sm font-semibold text-foreground">Текст</h2>
          <Input
            name="minLength"
            type="number"
            min={1}
            max={50000}
            label="Минимальная длина ответа (символов)"
            defaultValue={String(initial?.minLength ?? 10)}
            disabled={pending}
          />
          <Textarea
            name="instruction"
            label="Дополнительные инструкции (показываются студенту)"
            rows={4}
            defaultValue={initial?.instruction ?? ""}
            disabled={pending}
          />
        </div>
      ) : null}

      <div className="flex flex-wrap gap-2">
        <Button type="submit" loading={pending}>
          {initial?.id ? "Сохранить" : "Создать задание"}
        </Button>
        <Button type="button" variant="outline" asChild>
          <Link href="/admin/practical-tasks">К списку</Link>
        </Button>
      </div>
    </form>
  );
}
