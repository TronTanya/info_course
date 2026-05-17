# UX screenshots — placeholder

В этом каталоге **нет готовых изображений** (намеренно: не добавляем фейковые скриншоты в git).

## Зачем

Снимки для защиты проекта, README и онбординга: показать цельный student flow и админку.

## Требования

- Формат: **PNG** или **WebP**
- Ширина: **1280–1920 px**
- Тема: светлая или тёмная — по желанию, но единообразно в наборе
- **Без** реальных ПДн, email студентов, API-ключей, токенов в URL

## Какие экраны добавить

| Файл | Экран | Подсказка |
|------|--------|-----------|
| `01-landing.png` | **Landing / home** (`/`) | Hero, блоки «как это работает», CTA регистрации |
| `02-dashboard.png` | **Student dashboard** (`/dashboard`) | Welcome, continue learning, прогресс, сертификат |
| `03-course.png` | **Course map** (`/dashboard/course`) | Модули, % курса, «следующий шаг» |
| `04-lesson.png` | **Lesson** (`/dashboard/course/.../lesson`) | Текст лекции, боковая навигация шагов, progress strip |
| `05-test.png` | **Test** (`/dashboard/course/.../test`) | Вопрос, индикатор «N из M», кнопки навигации |
| `06-practice.png` | *(опционально)* **Practice** | Лаборатория / форма отправки |
| `07-admin.png` | **Admin dashboard** (`/admin`) | KPI, быстрые ссылки, статус системы |

Дополнительно (по желанию): `08-certificate.png` (страница сертификата), `09-auth.png` (login).

## Как снять

1. Поднять dev: `cd cyberedu && RUN_SEED=1 docker compose up` (или staging).
2. Войти как `student@cyberedu.local` / admin — пароль из локального `.env` (не коммитить).
3. Пройти до нужного экрана; скрыть чувствительные поля в профиле при публикации.
4. Сохранить файлы в **этот каталог** с именами из таблицы.
5. В корневом [README.md](../../../README.md) § «Скриншоты» раскомментировать или добавить вставки:

```markdown
![Student dashboard](./cyberedu/docs/screenshots/02-dashboard.png)
```

Полное operations-руководство: [../OPERATIONS.md](../OPERATIONS.md#ux-screenshots-placeholder).
