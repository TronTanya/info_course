# UX screenshots

Реальные снимки интерфейса CyberEdu для README, защиты проекта и онбординга.

## Автоматическая генерация (рекомендуется)

1. Поднять приложение с seed-данными:

   ```bash
   cd cyberedu
   RUN_SEED=1 docker compose up -d postgres
   cd frontend && npm run db:seed   # при первом запуске
   npm run build && npm run start
   ```

2. Сгенерировать PNG (1280×720, Playwright):

   ```bash
   cd cyberedu/frontend
   npm run screenshots
   ```

Скрипт: [`e2e/screenshots.spec.ts`](../../frontend/e2e/screenshots.spec.ts) · конфиг: `playwright.screenshots.config.ts`.

Учётные записи — seed/E2E (`E2E_USE_SEED_CREDENTIALS=1`), без production-секретов. Переопределение: `E2E_STUDENT_EMAIL`, `E2E_STUDENT_PASSWORD`, `E2E_ADMIN_*`.

## Файлы

| Файл | Экран |
|------|--------|
| `01-landing.png` | Landing (`/`) |
| `09-login.png` | Вход (`/auth/login`) |
| `02-dashboard.png` | Кабинет студента (`/dashboard`) |
| `03-course.png` | Карта курса (`/dashboard/course`) |
| `04-lesson.png` | Лекция (`/dashboard/course/…/lesson`) |
| `05-test.png` | Тест модуля (`/dashboard/course/…/test`) |
| `07-admin.png` | Админ-панель (`/admin`) |

Опционально вручную: `06-practice.png`, `08-certificate.png`.

## Требования к публикации

- Формат PNG или WebP, ширина 1280–1920 px
- Без реальных ПДн, API-ключей и секретов в URL
- Единая тема (светлая/тёмная) в наборе

## Ручная съёмка

Если Playwright недоступен: войдите как `student@cyberedu.local` / `admin@cyberedu.local` (пароль из локального `.env`, не коммитить), пройдите экраны из таблицы и сохраните файлы с теми же именами.

Подробнее: [../OPERATIONS.md](../OPERATIONS.md#ux-screenshots).
