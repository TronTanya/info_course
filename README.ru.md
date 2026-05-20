# CyberEdu — платформа обучения кибербезопасности

[English portfolio README](./README.md) · Код: [`cyberedu/`](./cyberedu/)

**CyberEdu** — полнофункциональная **LMS по информационной безопасности**: модули, лекции, тесты, практические лаборатории, **AI-наставник**, PDF-сертификаты с публичной проверкой и **админ-панель** с обзором обучения и безопасности.

---

## Краткое описание

Студент проходит траекторию «лекция → тест модуля → практика», видит прогресс в кабинете и может получить сертификат. Администратор управляет контентом, проверяет работы, выгружает пользователей и смотрит аудит. AI (опционально, OpenAI-compatible API) адаптирует лекции и подсказывает в контексте урока **без выдачи ответов на тесты и практику**.

---

## Демо

| Ресурс | Статус |
|--------|--------|
| **Публичный demo URL** | В репозитории не развёрнут. Локально или свой VPS — [`cyberedu/docs/DEPLOYMENT.md`](./cyberedu/docs/DEPLOYMENT.md). |
| **Скриншоты** | [`cyberedu/docs/screenshots/`](./cyberedu/docs/screenshots/) · `cd cyberedu/frontend && npm run screenshots` |
| **Видео** | *Добавьте ссылку на запись (Loom / YouTube), когда будет готова.* |

```bash
cd cyberedu && RUN_SEED=1 docker compose up --build
# → http://localhost:3100
```

Учётки после seed: `student@cyberedu.local`, `admin@cyberedu.local` (пароль — только локальный `.env`, **не для production**).

---

## Возможности

- **Модули курса** — линейная разблокировка, прогресс
- **Тесты** — проверка на сервере, без утечки эталонов клиенту
- **Практика** — фишинг, URL, крипто, логи, консоль, файлы
- **AI-наставник** — чат и адаптация лекций, модерация
- **Кабинет студента** — продолжение обучения, roadmap, сертификат
- **Проверка сертификата** — `/certificate/verify/[код]`
- **Админка** — LMS overview, студенты, очередь, audit
- **Безопасность** — RBAC, CSRF, rate limit, audit log, headers

---

## Стек

Next.js · React 19 · TypeScript · Tailwind · Prisma · PostgreSQL · Redis · FastAPI · Docker · Vitest · Playwright

Подробнее: [README.md](./README.md#tech-stack) (EN).

---

## Архитектура

Основная логика — **Next.js**; **FastAPI** — health и internal API; **PostgreSQL**; в production — **Redis** и **Nginx**.

Схема и маршруты: [`cyberedu/docs/ARCHITECTURE.md`](./cyberedu/docs/ARCHITECTURE.md).

---

## Безопасность

RBAC (`USER` / `ADMIN`) · CSRF на mutating `/api/*` · rate limit (Redis в prod) · `SecurityAuditLog` · security headers · ограничения загрузок (local volume).

Детали: [`cyberedu/docs/SECURITY.md`](./cyberedu/docs/SECURITY.md).

---

## Скриншоты

| Экран | Файл |
|-------|------|
| Landing | `01-landing.png` |
| Кабинет | `02-dashboard.png` |
| Курс | `03-course.png` |
| Урок | `04-lesson.png` |
| Тест | `05-test.png` |
| Практика | `06-practice.png` |
| Админка | `07-admin.png` |
| Сертификат | `08-certificate.png` |
| Вход | `09-login.png` |

Каталог: [`cyberedu/docs/screenshots/`](./cyberedu/docs/screenshots/).

---

## Локальная разработка

```bash
cd cyberedu
cp .env.example .env
RUN_SEED=1 docker compose up --build
```

Операции: [`cyberedu/README.md`](./cyberedu/README.md).

---

## Production

```bash
cd cyberedu
cp .env.prod.example .env.production
docker compose -f docker-compose.prod.yml --env-file .env.production up -d --build
```

`RUN_SEED=0` · `ENVIRONMENT=production` · [`docs/GO_LIVE_CHECKLIST.md`](./cyberedu/docs/GO_LIVE_CHECKLIST.md)

---

## Тесты

```bash
cd cyberedu/frontend
npm run lint && npm run typecheck && npm test
npm run test:e2e   # приложение на :3100 + seed
```

---

## Ограничения

| Тема | Сейчас |
|------|--------|
| **S3** | Только local volume; multi-replica — нет |
| **Масштабирование** | JWT без shared store; sticky / S3 |
| **VM labs** | Учебные сценарии в браузере, не KVM на студента |
| **Мониторинг** | Health + optional Prometheus; без bundled APM |

Roadmap: [`cyberedu/docs/STORAGE.md`](./cyberedu/docs/STORAGE.md) · [`PRODUCTION_READINESS.md`](./cyberedu/docs/PRODUCTION_READINESS.md)

---

## Лицензия

[MIT](./LICENSE)

---

*Учебный инженерный проект. Не выкладывайте seed и dev-секреты в открытый интернет.*
