# Demo database snapshot

`docker-demo-data.sql` — data-only dump from local Docker Postgres (289 users, progress, modules, etc.).

## Restore (dev)

```bash
cd cyberedu
docker compose up -d postgres
cd frontend && npx prisma migrate deploy
docker compose exec -T postgres psql -U cyberedu -d cyberedu < ../deploy/db/docker-demo-data.sql
```

Fresh volume (no seed conflicts):

```bash
cd cyberedu
docker compose down -v
docker compose up -d postgres
cd frontend && npx prisma migrate deploy
docker compose exec -T postgres psql -U cyberedu -d cyberedu < ../deploy/db/docker-demo-data.sql
```

## Demo logins

| Role    | Email                   | Password       |
|---------|-------------------------|----------------|
| Student | student@cyberedu.local  | Student12345!  |
| Admin   | admin@cyberedu.local    | Admin12345!    |

## Re-export from running container

```bash
docker exec cyberedu-postgres-1 pg_dump -U cyberedu -d cyberedu \
  --data-only --no-owner --no-acl --exclude-table-data=_prisma_migrations \
  > cyberedu/deploy/db/docker-demo-data.sql
```

Adjust container name if your compose project differs (`docker ps`).

## Restore to Supabase (production)

After `git pull`, with `DIRECT_URL` in `frontend/.env`:

```powershell
cd cyberedu
powershell -ExecutionPolicy Bypass -File .\scripts\restore-demo-data-to-supabase.ps1
```

Requires Docker Desktop (uses `postgres:16-alpine` image for `psql`). Then refresh Vercel admin `/admin/users`.
