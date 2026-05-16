# CyberEdu

**CyberEdu** — интерактивная платформа курса по информационной безопасности: лекции, тесты, практика, AI-адаптация под интересы пользователя, сертификат, админ-панель.

**Визуальный бренд:** логотипы и favicon — `cyberedu/frontend/public/brand/`.

## Документация

| Документ | Описание |
|----------|----------|
| [`cyberedu/README.md`](./cyberedu/README.md) | Запуск, демо-доступ, сценарии |
| [`cyberedu/docs/PRODUCTION_READINESS.md`](./cyberedu/docs/PRODUCTION_READINESS.md) | Оценка готовности к production |
| [`cyberedu/docs/ARCHITECTURE.md`](./cyberedu/docs/ARCHITECTURE.md) | Архитектура |
| [`cyberedu/docs/SECURITY.md`](./cyberedu/docs/SECURITY.md) | Безопасность |
| [`cyberedu/docs/DEPLOYMENT.md`](./cyberedu/docs/DEPLOYMENT.md) | Production deployment |
| [`cyberedu/docs/API.md`](./cyberedu/docs/API.md) | HTTP API |
| [`cyberedu/docs/checklists/`](./cyberedu/docs/checklists/) | Final / Release / Security / Deploy чеклисты |

**CI:** [`.github/workflows/ci.yml`](./.github/workflows/ci.yml) · **Release:** [`.github/workflows/release.yml`](./.github/workflows/release.yml)

Запуск **только через Docker** из каталога `cyberedu/`:

```bash
cp .env.example .env
docker compose up --build
```

- Сайт (Next.js): http://localhost:3100 — в Docker нужна **пересборка** образа после правок кода; для UI без пересборки см. **`cyberedu/scripts/design-live.sh`** в `cyberedu/README.md`.
- Backend (OpenAPI): http://localhost:18000/docs  
- pgAdmin: http://localhost:15050  
