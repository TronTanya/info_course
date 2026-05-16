# API — CyberEdu

Контракты публичных и internal HTTP API. OpenAPI backend (dev only): `http://localhost:18000/docs`.

## Base URLs

| Environment | Frontend | Backend (via Nginx) |
|-------------|----------|---------------------|
| Local dev | `http://localhost:3100` | `http://localhost:18000` |
| Production | `https://<domain>` | `https://<domain>/api/v1` |

## Authentication

### Browser session (Next.js)

Cookie session after NextAuth login. Used by UI and same-origin `fetch` to `/api/*`.

### CSRF (mutating Next API)

Required for `POST`/`PUT`/`PATCH`/`DELETE` on `/api/*` except `/api/auth/*`.

- Valid `Origin` / `Referer` matching app URL
- CSRF cookie + header (see `lib/security/csrf.ts`)

### Internal API key (FastAPI)

```http
GET /api/v1/course-progress HTTP/1.1
Host: <domain>
X-API-Key: <INTERNAL_API_KEY>
```

Missing/invalid key → `401` / `403` (production fail-closed).

---

## Next.js Route Handlers (`/api`)

### Health

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/health` | No | Liveness `{ status, service, timestamp }` |

### Auth

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| * | `/api/auth/[...nextauth]` | — | NextAuth handlers |

### AI

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/api/ai/chat` | Session | Tutor chat; body: `message`, optional `moduleId`, `lessonId`, `practicalTaskId`, `history` |
| POST | `/api/ai/lesson-adapt` | Session | Adapt lesson content |
| POST | `/api/ai/adapt-lesson` | Session | Legacy/adapt alias |

**Response (chat):** `{ reply, meta?: { topic, difficulty, recommendations, refused } }`

### Certificates

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/api/certificates/generate` | Session | Issue certificate PDF record |
| GET | `/api/certificates/download/[certificateId]` | Session | Download PDF |

### Practice

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/api/practice/upload-file` | Session | Upload submission file |
| GET | `/api/practice/download?id=` | Session | Download own submission file |
| POST | `/api/practice/submit-combined` | Session | Combined form submit |
| POST | `/api/practice/crypto/check` | Session | Crypto lab check |
| POST | `/api/practice/phishing/check` | Session | Phishing lab check |
| POST | `/api/practice/url-analysis/check` | Session | URL analysis check |
| POST | `/api/practice/log-analysis/check` | Session | Log analysis check |

### Profile

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET/POST | `/api/profile/avatar` | Session | Avatar metadata |
| POST | `/api/profile/avatar/upload` | Session | Upload avatar |
| GET | `/api/profile/avatar/image` | Session | Serve avatar image |

### Admin

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/admin/users/export` | Admin + `withApiGuard` | CSV export users/progress |

### Error shape (typical)

```json
{ "error": "Human-readable message" }
```

Status: `401` unauthorized, `403` forbidden/CSRF, `429` rate limit, `4xx` validation.

---

## FastAPI (`/api/v1`)

Production OpenAPI disabled. Contract from code + schemas.

### Health

| Method | Path | Auth | Response |
|--------|------|------|----------|
| GET | `/api/v1/health` | No* | `{ "status": "ok", "service": "cyberedu-api" }` |

\*Public health on internal network; external access only via Nginx same host.

### Course progress

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/v1/course-progress` | `X-API-Key` | List/filter progress records |

**Query params:** `user_id`, `group_name`, `college`, `course`, `year`, `completed_from`, `completed_to`, `limit` (max 2000).

**Response:** array of `CourseProgressRead` (Pydantic).

### Users

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/v1/users/{user_id}` | `X-API-Key` | User by UUID; `404` if missing |

---

## Server Actions (not REST)

Major mutations also exposed as Next.js Server Actions in `lib/actions/`:

- `register`, `logout`
- `test` (submit attempt)
- `practice` (submissions)
- Admin forms

Same session + CSRF policies apply per Next.js conventions.

---

## Rate limits (summary)

See [SECURITY.md](./SECURITY.md). Exceeded → HTTP `429` with JSON/text error.

---

## Versioning

- **Next API:** unversioned path `/api/...` — breaking changes require coordinated frontend deploy
- **FastAPI:** prefix `/api/v1` — bump v2 for breaking backend changes

---

## Client examples

### Health check

```bash
curl -fsS https://example.com/api/health
```

### Internal course progress

```bash
curl -fsS -H "X-API-Key: $INTERNAL_API_KEY" \
  "https://example.com/api/v1/course-progress?limit=10"
```

### AI chat (browser session cookies required)

```bash
curl -X POST https://example.com/api/ai/chat \
  -H "Content-Type: application/json" \
  -H "Origin: https://example.com" \
  -d '{"message":"Что такое фишинг?","moduleId":"..."}'
```

---

## Gaps / roadmap

- [ ] OpenAPI spec export for Next routes (or tRPC)
- [ ] Unified `withApiGuard` on all `/api` routes
- [ ] Public webhook API (none today)
