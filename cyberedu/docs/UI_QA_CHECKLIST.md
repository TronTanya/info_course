# UI/UX QA Checklist — Design System v4

Чеклист перед релизом редизайна (Phase 0–3). Отмечайте `[x]` по мере проверки.

## Окружение

- [x] `npm run build` в `cyberedu/frontend` без ошибок
- [x] E2E: `E2E_USE_SEED_CREDENTIALS=1 npx playwright test tests/e2e/landing-public.spec.ts tests/e2e/smoke.spec.ts tests/e2e/navigation/command-palette-mobile.spec.ts`
- [x] Visual: `npm run test:e2e:visual` (4 baselines в `tests/visual/__screenshots__/`)
- [ ] Chrome + Safari (desktop), iOS Safari (mobile)

---

## 1. Landing `/`

### Структура (3 акта)

- [ ] Hero: заголовок, CTA «Запустить», ссылка на `#product`
- [ ] `#product`: метрики, программа, цикл обучения, лабы, AI
- [ ] `#start`: сертификат + «Создать аккаунт» / «Уже есть аккаунт»
- [ ] Навигация: Главная · Платформа · Начать

### Визуал

- [ ] Акцент **indigo** (#6366f1), не старый violet
- [ ] Mobile: нет тяжёлых анимаций mesh/particles
- [ ] Desktop: hero visual подгружается (lazy), без blur-лагов
- [ ] `prefers-reduced-motion`: анимации отключены

### Производительность

- [ ] LCP — текст hero, не canvas
- [ ] Нет горизонтального scroll
- [ ] CLS < 0.12 (e2e `landing-public`)

---

## 2. Auth `/auth/*`

- [ ] Одна колонка по центру, без правой cyber-панели
- [ ] Карточка solid, без terminal `$ auth`
- [ ] Login / Register / Forgot / Verify — читаемые поля и ошибки
- [ ] Light + dark theme

---

## 3. Dashboard `/dashboard`

### Иерархия

- [ ] Первый блок: «Продолжить обучение»
- [ ] Метрики → объединённый «Прогресс программы»
- [ ] Нет блока «Быстрые действия» (заменён ⌘K)

### Desktop (≥1280px)

- [ ] AI-наставник **встроен справа** (docked), не только FAB
- [ ] Панели без blur-reveal при скролле
- [ ] Hover lift только на кликабельных элементах

### Mobile

- [ ] FAB наставника внизу справа
- [ ] Floating nav + drawer работают
- [ ] Mobile drawer: кнопка «Команды»; в шапке — иконка (Ctrl+K глобально)

### Command palette

- [ ] `⌘K` / `Ctrl+K` открывает палитру
- [ ] Поиск: Кабинет, Курс, AI-наставник, тема
- [ ] Enter выполняет действие, Esc закрывает

---

## 4. Learn / Lesson

- [ ] Текст лекции: **~65ch**, flat surface
- [ ] Sidebar solid, без «мыльного» glass
- [ ] Прогресс / step nav на mobile
- [ ] AI FAB на уроке открывается

---

## 5. Admin `/admin`

- [ ] **Светлая** readable-среда даже при глобальной dark theme
- [ ] Таблицы пользователей: текст не пропадает при scroll
- [ ] Нет TechAmbient / glow flicker
- [ ] Формы создания/редактирования читаемы

---

## 6. Темы

- [ ] Dark: zinc фон, indigo primary
- [ ] Light: контраст карточек и border
- [ ] Переключатель в шапке + палитра «Тема»

---

## 7. Регрессии (критично)

- [ ] Сертификат PDF / preview
- [ ] Тесты и практика (submit, timer)
- [ ] Email verify flow
- [ ] Admin RBAC (студент не видит `/admin`)

---

## 8. Доступность

- [ ] Skip link «Перейти к содержимому»
- [ ] Focus ring на кнопках и ссылках
- [ ] Dialog: mentor, onboarding, command palette — focus trap
- [ ] `aria-labelledby` на секциях landing

---

## Быстрый smoke (5 мин)

1. `/` — scroll 3 секции, клик CTA  
2. `/auth/login` — форма  
3. `/dashboard` — continue hero + ⌘K + docked AI (desktop)  
4. `/dashboard/course/.../lesson` — читаемость текста  
5. `/admin` — светлая таблица users  

---

## Известные отложенные items

- Landing: старые standalone-секции (`LandingWhatYouLearn` и др.) оставлены для reuse, не на главной
- `AuthVisualPanel` — не используется, можно удалить в отдельном PR
- Visual baselines: закоммитьте `frontend/tests/visual/__screenshots__/` при изменении UI

---

*Обновлено: Design System v4 rollout*
