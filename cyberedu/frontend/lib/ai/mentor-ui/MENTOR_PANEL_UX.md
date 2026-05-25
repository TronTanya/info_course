# AI-наставник — учебная панель (UX)

## Идея

Наставник — не «чат в углу», а **учебная панель** с явными режимами обучения. Каждый режим:

1. Показывается как кнопка с описанием (контекстно, не все 7 везде).
2. Отправляет **безопасный user-prompt** (`buildMentorModePrompt`).
3. Добавляет на сервере **отдельный policy-блок** в system prompt (`buildMentorModeSystemBlock`).

Базовый контракт безопасности остаётся в `buildTutorSystemPrompt` + модерация pipeline.

## Режимы

| ID | Название | Назначение |
|----|----------|------------|
| `simpler` | Объясни проще | Тезисы простыми словами + проверочный вопрос |
| `example` | Приведи пример | Безопасный учебный кейс |
| `check` | Проверь моё понимание | 2–3 вопроса самопроверки |
| `summary` | Сделай конспект | Резюме урока (не практики/теста) |
| `hint` | Дай подсказку | Направление без готового ответа |
| `review_error` | Разбор ошибки | После теста, без correct answers |
| `structure_answer` | Оформить вывод | Структура ответа в практике |

## Поверхности (где доступен)

| Поверхность | Страница | Режимы |
|-------------|----------|--------|
| `lesson` | Урок | simpler, example, check, summary, hint |
| `practice` | Практика | simpler, example, check, hint, structure_answer |
| `test_result` | После теста / итог в chips | simpler, example, check, review_error |
| `dashboard` | Кабинет (+ last test summary) | все кроме structure_answer; review_error если есть testSummary |
| `standalone` | `/mentor` (опционально) | полный набор |

## Размещение в продукте

- **Урок**: встроенная панель (`lesson-ai-mentor-panel`) + FAB `AiMentorChat` с `lessonId`.
- **Практика**: `practice-ai-mentor-panel` + FAB с `practicalTaskId`, `practiceSocraticHints`.
- **Тест**: экран результата передаёт `contextLabels.testSummary` → режим «Разбор ошибки».
- **Dashboard**: `DashboardMentorHost` + `testSummary` из последнего теста.
- **`/mentor`**: отдельная страница (опционально) — `standalone`, общие подсказки.

## Безопасность

- **robots / auth**: только авторизованные; metadata и индексация не относятся к наставнику.
- **Контекст на сервер**: лекция (очищенный excerpt), практика (описание без эталона), `testReviewHint` (процент/зачёт, без ключей).
- **Отказ**: при запросе готового ответа — `academic_integrity` / шаблоны refusal + текст в mode policy.
- **Тест/практика**: дополнительные блоки строгости в `SURFACE_STRICTNESS`.

## API

`POST /api/ai/chat`:

- `mentor_mode_id` — активирует policy режима.
- `test_review_hint` — краткий итог теста (≤400 символов).
- `practice_socratic_hints` — true на практике.

## UI-компоненты

- `MentorModesBar` — режимы по `surface`.
- `MentorContextBar` — chips модуля / урока / практики / теста.
- `MentorEmptyState` — список доступных режимов.
- `MentorRefusalState` / `MentorGuardrailCallout` — отказ и подсказка.

## Mobile UX (этап 17)

Проверять на **360 / 390 / 768 / 1024 / 1440** px.

| Зона | Поведение |
|------|-----------|
| FAB + dialog | `< lg` — bottom sheet на всю ширину, `88dvh`, backdrop, FAB скрыт при открытии; FAB выше нижней навигации/CTA (`5.75rem + safe-area`) |
| Клавиатура | `useVisualViewportInset` поднимает dialog и уменьшает `max-height` |
| Режимы | В панели чата — `layout="scroll"`; в селекторе `responsive` — горизонтальный скролл до `md` |
| Composer | Кнопка «Отправить» `min-h-11`, на узких экранах на всю ширину; footer с `safe-area-inset-bottom` |
| Урок | Desktop — sidebar (`hidden lg:block`); mobile — `LessonAIMentorPanel` inline под материалом |
| Практика | Desktop — aside; mobile — панель под формой + drawer «Чеклист и навигация» |
| Overflow | `overflow-x-clip` на dialog, panel, bubbles; код только в `.ce-mentor-code-pre` |

## Связь с адаптацией урока

На уроке «Объясни проще» / «Пример» / «Конспект» могут идти через **адаптацию лекции** (`lesson-ai` tabs) или через **чат-режим** — оба пути согласованы по названиям, чат использует tutor pipeline.
