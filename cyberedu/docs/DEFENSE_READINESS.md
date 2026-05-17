# Финальный чеклист готовности (защита / пилот)

Проект можно считать **готовым к защите или пилоту**, если проходят автоматические команды ниже и отмечены ручные проверки.

Связанные документы: [GO_LIVE_CHECKLIST.md](./GO_LIVE_CHECKLIST.md) · [OPERATIONS.md](./OPERATIONS.md) · [checklists/FINAL_CHECKLIST.md](./checklists/FINAL_CHECKLIST.md)

---

## Предусловия

| Что | Зачем |
|-----|--------|
| Docker | `compose config`, Postgres, Redis |
| `cyberedu/frontend/.env` с `DATABASE_URL` | Prisma, E2E persistence |
| Seed | `student@cyberedu.local` / `admin@cyberedu.local` (dev only) |
| Redis на `127.0.0.1:6379` | prod E2E и rate limit |

### Окружение A — dev E2E (`test:e2e`)

Нужно приложение на **http://127.0.0.1:3100** в **обычном dev/test** режиме (достаточно `npm run dev`).

```bash
cd cyberedu
cp -n .env.example .env 2>/dev/null || true
docker compose up -d postgres redis
cd frontend
# В .env: DATABASE_URL на :15432 (см. .env.example), REDIS_URL=redis://127.0.0.1:6379/0
npx prisma migrate deploy && npm run db:seed   # или RUN_SEED=1 docker compose up --build -d

# Терминал 1 — оставить запущенным:
npm run dev
```

Playwright для dev smoke сам выставляет `ENVIRONMENT=test` — **не путать** с режимом сервера.

### Окружение B — prod E2E (`test:e2e:prod`)

Тесты задают `ENVIRONMENT=production` только процессу Playwright. **Сервер** на `:3100` тоже должен работать с `ENVIRONMENT=production` и `REDIS_URL`, иначе `/api/health` вернёт `checks.redis: "skipped"` и global-setup упадёт.

**Рекомендуется (один скрипт, без ручного перезапуска):**

```bash
cd cyberedu/frontend
npm run test:e2e:prod:local
# (= migrate + seed + build + start с ENVIRONMENT=production + test:e2e:staging)
```

**Вручную** (если уже подняты Postgres + Redis):

```bash
cd cyberedu/frontend
export ENVIRONMENT=production
export REDIS_URL=redis://127.0.0.1:6379
export AUTH_SECRET="${AUTH_SECRET:-local-e2e-prod-auth-secret-minimum-32-chars}"
export AUTH_URL=http://127.0.0.1:3100
export NEXT_PUBLIC_APP_URL=http://127.0.0.1:3100
npx prisma migrate deploy && npm run db:seed
npm run build && npm run start
# Дождаться: curl -s http://127.0.0.1:3100/api/health | jq .checks.redis  → "ok"
```

После dev E2E **нельзя** сразу запускать `test:e2e:prod` против того же `npm run dev` — перезапустите приложение по варианту B или используйте `test:e2e:prod:local`.

---

## Автоматические команды

### Фаза 1 — без запущенного приложения

Из **корня репозитория**:

```bash
docker compose --env-file cyberedu/.env.prod.example \
  -f cyberedu/docker-compose.prod.yml config --quiet

cd cyberedu/frontend
npm ci
npm run lint
npm run typecheck
npm test
npx prisma validate
```

### Фаза 2 — dev E2E

**Предусловие:** [окружение A](#окружение-a--dev-e2e-teste2e) (`npm run dev` в отдельном терминале).

```bash
cd cyberedu/frontend
npm run test:e2e -- --project=desktop
```

### Фаза 3 — production-like E2E

**Предусловие:** [окружение B](#окружение-b--prod-e2e-teste2eprod) — **не** тот же процесс, что для фазы 2.

**Вариант 1 (предпочтительно):**

```bash
cd cyberedu/frontend
npm run test:e2e:prod:local
```

**Вариант 2** (сервер уже в `ENVIRONMENT=production`, health → `redis: "ok"`):

```bash
cd cyberedu/frontend
REDIS_URL=redis://127.0.0.1:6379 npm run test:e2e:prod
```

---

### Примечания к E2E

| Команда | Ожидание | Замечание |
|---------|----------|-----------|
| `npm run test:e2e` | desktop + mobile | Параллельные проекты могут конфликтовать по Redis. Гейт: `--project=desktop`. |
| `npm run test:e2e -- --project=desktop` | **11 passed**, **1 skipped** | Нужен dev-сервер (фаза 2). |
| `npm run test:e2e:prod` | **4 passed**, **1 skipped** | Нужен **production**-сервер + Redis `ok` в health (фаза 3). `DATABASE_URL` из `frontend/.env`. |
| `npm run test:e2e:prod:local` | как prod | Сам поднимает build+start; не требует отдельного `npm run dev`. |

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
| Объём контента | 8 модулей × 1 лекция (см. seed) |
| AI | Без API-ключа — деградация, без полного тьютора |

---

## Быстрый прогон (без ловушки «dev → prod подряд»)

```bash
# Статика + unit
cd cyberedu/frontend
npm ci && npm run lint && npm run typecheck && npm test && npx prisma validate
cd ../.. && docker compose --env-file cyberedu/.env.prod.example \
  -f cyberedu/docker-compose.prod.yml config --quiet

# Dev E2E — в другом терминале должен быть npm run dev (см. окружение A)
cd cyberedu/frontend && npm run test:e2e -- --project=desktop

# Prod E2E — отдельно, скрипт сам поднимает production-like сервер
cd cyberedu/frontend && npm run test:e2e:prod:local
```

После автоматики — пройти **ручной** блок выше.
