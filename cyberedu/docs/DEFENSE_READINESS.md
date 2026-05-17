# Финальный чеклист готовности (защита / пилот)

Проект можно считать **готовым к защите или пилоту**, если проходят автоматические команды ниже и отмечены ручные проверки.

Связанные документы: [GO_LIVE_CHECKLIST.md](./GO_LIVE_CHECKLIST.md) · [OPERATIONS.md](./OPERATIONS.md) · [checklists/FINAL_CHECKLIST.md](./checklists/FINAL_CHECKLIST.md)

---

## Предусловия

| Что | Зачем |
|-----|--------|
| Docker (для compose validate; для E2E — Postgres + Redis) | БД и rate limit |
| Приложение на **http://127.0.0.1:3100** | Playwright smoke |
| `cyberedu/frontend/.env` с `DATABASE_URL` | E2E, Prisma |
| Seed (`RUN_SEED=1` в dev compose или `npm run seed`) | Учётки `student@cyberedu.local` / `admin@cyberedu.local` |
| Redis на `127.0.0.1:6379` | `test:e2e:prod` |

```bash
# Пример: dev-стек + seed
cd cyberedu && cp .env.example .env && RUN_SEED=1 docker compose up --build -d
# или только БД/Redis + локальный Next:
cd cyberedu/frontend && npm run dev
```

---

## Автоматические команды (из корня репозитория)

Выполняйте по порядку. Все должны завершиться с **exit code 0** (допустимы **skipped** в E2E — см. примечания).

```bash
docker compose --env-file cyberedu/.env.prod.example \
  -f cyberedu/docker-compose.prod.yml config --quiet

cd cyberedu/frontend
npm ci
npm run lint
npm run typecheck
npm test
npm run test:e2e -- --project=desktop
REDIS_URL=redis://127.0.0.1:6379 npm run test:e2e:prod
npx prisma validate
```

### Примечания к E2E

| Команда | Ожидание | Замечание |
|---------|----------|-----------|
| `npm run test:e2e` | 12 desktop + 12 mobile | Проекты **desktop** и **mobile** могут идти **параллельно** → иногда падает mobile login (общий Redis/сессии). Для **стабильного гейта** используйте `--project=desktop`. |
| `npm run test:e2e -- --project=desktop` | **11 passed**, **1 skipped** | Skip: практика TEXT, если тест модуля ещё не пройден в сценарии. |
| `npm run test:e2e:prod` | **4 passed**, **1 skipped** | `DATABASE_URL` подхватывается из `frontend/.env` (global-setup). Нужен Redis и `/api/health` с `checks.redis: "ok"`. Skip: нет TEXT-практики в первом доступном модуле. |

### Результат прогона (локально, для ориентира)

| Команда | Статус |
|---------|--------|
| `docker compose … config --quiet` | ✅ |
| `npm ci` | ✅ |
| `npm run lint` | ✅ |
| `npm run typecheck` | ✅ |
| `npm test` | ✅ 216 passed, 2 skipped |
| `npm run test:e2e -- --project=desktop` | ✅ 11 passed, 1 skipped |
| `REDIS_URL=… npm run test:e2e:prod` | ✅ 4 passed, 1 skipped (с `.env`) |
| `npx prisma validate` | ✅ |

---

## Ручная проверка (UI / сценарии)

Отмечайте `[x]` на **staging** или локально с seed. Учётки dev: см. `cyberedu/.env.example` (не использовать на публичном prod).

### Аутентификация

- [ ] **Регистрация** — `/auth/register`, валидация полей, вход после регистрации
- [ ] **Вход** — `/auth/login`, редирект на dashboard
- [ ] **Выход** — меню пользователя → выход, сессия сброшена, `/auth/login`

### Студент

- [ ] **Student dashboard** — прогресс, «продолжить обучение», мобильное меню
- [ ] **Прохождение урока** — текст, блоки `:::…:::`, отметка «лекция пройдена»
- [ ] **Сдача теста** — ответы, проход ≥ `minScore`, без ложного rate-limit
- [ ] **Сдача практики** — AUTO и/или TEXT (ожидание проверки преподавателем)
- [ ] **AI-наставник** — ответ по теме модуля, отказ от готового решения теста/практики
- [ ] **Сертификат** — все модули завершены → «Получить сертификат» → PDF
- [ ] **Проверка сертификата** — `/certificate/verify/<код>` публично, без авторизации

### Администратор

- [ ] **Admin dashboard** — `/admin`, метрики, только роль `ADMIN`
- [ ] **Создание/редактирование контента** — модули, лекции, тесты, практики
- [ ] **Review практики** — очередь submissions, оценка TEXT, смена статуса

### Прочее

- [ ] **Mobile version** — 390px: навигация, курс, лекция, формы (или `npm run test:e2e -- --project=mobile`)
- [ ] **Production deploy** — `docker-compose.prod.yml`, TLS, `RUN_SEED=0`, уникальные секреты, [OPERATIONS.md](./OPERATIONS.md)

---

## Production deploy (кратко)

- [ ] `.env.production` из [`.env.prod.example`](../.env.prod.example), не в git
- [ ] `docker compose -f docker-compose.prod.yml --env-file .env.production up -d --build`
- [ ] `docker compose ps` → сервисы **healthy**
- [ ] `CHECK_REDIS=1 BASE_URL=https://<домен> ./scripts/staging-smoke.sh`
- [ ] Админ создан вручную ([создание администратора](./OPERATIONS.md#создание-администратора-production))

---

## Известные ограничения (не блокируют пилот)

| Тема | Детали |
|------|--------|
| Uploads | `UPLOAD_STORAGE_DRIVER=local`, **одна реплика** frontend ([STORAGE.md](./STORAGE.md)) |
| S3 | **NOT IMPLEMENTED** |
| Объём контента | 8 модулей × 1 лекция (см. аудит контента в обсуждении / seed) |
| AI | Без API-ключа — деградация, без полного тьютора |

---

## Быстрый «всё зелёное» одной цепочкой

```bash
cd cyberedu/frontend
npm ci && npm run lint && npm run typecheck && npm test \
  && npm run test:e2e -- --project=desktop \
  && REDIS_URL=redis://127.0.0.1:6379 npm run test:e2e:prod \
  && npx prisma validate
cd ../.. && docker compose --env-file cyberedu/.env.prod.example \
  -f cyberedu/docker-compose.prod.yml config --quiet
```

После автоматики — пройти **ручной** блок выше и зафиксировать дату/окружение в журнале защиты.
