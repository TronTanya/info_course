# Persistent uploads volume

## Проблема

До unified volume practice- и avatar-файлы писались в `/app/uploads/...` **без** bind/named volume (в dev — только `certificates` был на volume). При `docker compose up --force-recreate` файлы терялись.

## Решение

1. Named volume `frontend_uploads` → `/app/uploads` (dev и prod).
2. `UPLOADS_DIR=/app/uploads` в compose.
3. Код использует `StorageService` (`lib/storage/`) с namespace:
   - `practice/` — вложения практикумов
   - `avatars/` — пользовательские аватары
   - `certificates/` — PDF сертификатов

## Миграция существующего деплоя

Если в production уже есть PDF в старом volume только для `certificates`:

```bash
# Пример: скопировать из старого cert-only volume в общий uploads (имена volume уточните через docker volume ls)
docker run --rm -v OLD_CERT_VOL:/from -v cyberedu-prod_frontend_uploads:/to alpine \
  sh -c "mkdir -p /to/certificates && cp -a /from/. /to/certificates/ 2>/dev/null || true"
```

После обновления compose перезапустите frontend — новые practice/avatar файлы сохраняются в том же volume.

## Локальная разработка вне Docker

По умолчанию: `<frontend>/uploads/`. Опционально: `UPLOADS_DIR=/path/to/writable/dir`.

## Будущее: S3

`STORAGE_DRIVER=s3` зарезервирован; реализация — отдельная задача (endpoint, bucket, credentials).
