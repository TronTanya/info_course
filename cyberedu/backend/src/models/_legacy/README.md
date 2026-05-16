# Deprecated SQLAlchemy education schema (snake_case)

Эти модели **не** регистрируются в Alembic и **не** создают таблицы.

Учебная схема владеет **Prisma** (`frontend/prisma/schema.prisma`).  
Для данных используйте `prisma migrate deploy` и `prisma/seed.ts`.

Скрипты в `backend/scripts/` могут импортировать `_legacy` только для одноразовой миграции данных — не для production.
