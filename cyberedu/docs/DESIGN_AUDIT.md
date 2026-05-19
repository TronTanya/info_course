# CyberEdu — аудит дизайн-системы

Обновлено: 2026-05-19

## Оценка покрытия Cyber Lab UI: ~90%

| Слой | % | Статус |
|------|---|--------|
| CSS-токены + semantic Tailwind | ~90% | ✅ |
| Shells (student / admin / marketing / auth) | ~85% | ✅ |
| Заголовки (Cyber / Admin) | ~85% | ✅ после миграции edit-форм |
| Glass / SectionCard vs Card | ~85% | ✅ (остался ui-kit dev) |
| Унификация терминала | ~90% | ✅ LabTerminal + TrainingConsole + TerminalBlock |
| Practice / AI surfaces | ~88% | ✅ `practice-task-ui`; 4 учебных задания |
| loading / error по маршрутам | ~50% | ⚠️ admin/auth error; profile/settings loading |

## Эталон (использовать в новом коде)

| Задача | Компонент / класс |
|--------|-------------------|
| Фон, текст | `bg-card`, `text-foreground`, `border-border` |
| Glass / lab | `SectionCard variant="lab"`, `cyber.panel`, `ce-glass` |
| Заголовок | `CyberPageHeader`, `AdminPageHeader` |
| Терминал | `LabTerminal`, `PracticeLabTerminal`, `ce-terminal-*` |
| Состояния | `EmptyState`, `ErrorCard`, `LoadingState`, `UiStatePanel` |
| Не использовать | `PageHeader` (legacy), raw `#hex`, `slate-*` |

## Токены терминала (`design-tokens.css`)

SOC-палитра **не зависит** от light/dark страницы: `--terminal-bg`, `--terminal-fg`, `--terminal-prompt`, `--terminal-accent`, `--terminal-success`.

## Выполнено (2026-05-19)

- [x] `PracticeLabTerminal` → обёртка `LabTerminal`
- [x] `practice-page-client` — slate → semantic tokens
- [x] `TrainingConsole` → `ce-terminal` + `ce-terminal-input`
- [x] Admin edit/create — `AdminPageHeader` вместо `PageHeader`
- [x] `ThemeToggle` на landing header (desktop + mobile drawer)
- [x] AI mentor — `ce-mentor-*` на `--terminal-*` (без hex в компонентах)
- [x] `terminal-block`, `learning-code-block` → `LabTerminal`
- [x] Admin/student reviews, `admin/users/[id]` — `SectionCard` / `AdminTableCard`
- [x] `app/admin/error.tsx`, `app/auth/error.tsx`
- [x] `loading.tsx` — profile, settings, certificate, module hub
- [x] Миграция production `Card` → `SectionCard` / `AdminTableCard` / `cyber.adminKpi`
- [x] Landing sections (problem, reviews, course-inside, feature-card)
- [x] `LogAnalysisTask` — terminal palette для логов
- [x] `practice-task-ui.tsx` — баннеры, шаги (`SectionCard lab`), результат
- [x] `PhishingEmailTask`, `UrlAnalysisTask`, `CryptoTask`, `LogAnalysisTask` — shared practice UI
- [x] `scenario-practice-forms` — баннер доработки на `warning` tokens

## Очередь (P2)

### P2
- [x] Удалены orphan `landing-problem`, `landing-production`
- [x] `UiStatePanel` — my-assignments, admin modules, admin lessons
- [x] `PracticeLabScenario` → `SectionCard variant="lab"`
- [x] `practice-page-client` — `ce-terminal-input` / `ce-terminal-dim` вместо emerald
- [x] `UiStatePanel` — все admin-списки + dashboard (activity, charts)

## Файлы с техническим долгом

```
components/practice/TrainingConsole.tsx     — ✅ ce-terminal
components/practice/practice-lab-terminal.tsx — ✅ LabTerminal
components/practice/practice-page-client.tsx  — ✅ semantic; terminal input emerald (legacy)
components/internal/ui-kit-showcase.tsx       — единственный потребитель `Card`
```

## Проверка регрессий

```bash
cd cyberedu/frontend && npm run typecheck && npm run lint && npm test
```

Визуально: landing hero terminal, practice lab, admin edit form, light/dark toggle на главной.
