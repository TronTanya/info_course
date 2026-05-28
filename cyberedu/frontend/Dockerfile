# При таймаутах к registry-1.docker.io: NODE_IMAGE=… в cyberedu/.env или
# docker compose build --build-arg NODE_IMAGE=ваш-реестр/node:20-bookworm-slim
ARG NODE_IMAGE=node:20-bookworm-slim
FROM ${NODE_IMAGE} AS deps
RUN apt-get update \
    && apt-get install -y --no-install-recommends openssl ca-certificates \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY package.json package-lock.json ./
COPY prisma ./prisma
COPY .npmrc ./.npmrc

# Кэш npm между сборками (нужен BuildKit: docker compose build).
# Доп. таймауты — против EIDLETIMEOUT / registry.npmjs.org при нестабильной сети (полный fetch до 60 мин).
ENV NPM_CONFIG_FETCH_TIMEOUT=3600000
ENV NPM_CONFIG_FETCH_RETRIES=15
RUN --mount=type=cache,target=/root/.npm \
    npm ci --no-audit --no-fund

FROM ${NODE_IMAGE} AS builder
RUN apt-get update \
    && apt-get install -y --no-install-recommends openssl ca-certificates \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Метка попадает в серверный бандл Next (надёжнее, чем читать public/ в standalone)
RUN node -e "require('fs').writeFileSync('lib/docker-build-stamp.ts', 'export const DOCKER_IMAGE_BUILD_STAMP = ' + JSON.stringify(new Date().toISOString()) + ';\\n');"

ENV NEXT_TELEMETRY_DISABLED=1

# Только placeholder на этапе сборки — не передавайте реальные секреты через --build-arg.
# Runtime: DATABASE_URL, AUTH_SECRET, OPENAI_API_KEY задаются в docker-compose (environment / env_file).
ARG DATABASE_URL=postgresql://build:build@127.0.0.1:5432/cyberedu?schema=public
ARG DIRECT_URL=postgresql://build:build@127.0.0.1:5432/cyberedu?schema=public
ARG AUTH_SECRET=build-placeholder-secret-min-32-chars-do-not-use-in-prod
ENV DATABASE_URL=${DATABASE_URL}
ENV DIRECT_URL=${DIRECT_URL}
ENV AUTH_SECRET=${AUTH_SECRET}

RUN --mount=type=cache,target=/root/.npm \
    --mount=type=cache,target=/app/.next/cache \
    npx prisma generate \
    && npm run build

FROM ${NODE_IMAGE} AS runner
RUN apt-get update \
    && apt-get install -y --no-install-recommends openssl ca-certificates \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

RUN groupadd --system --gid 1001 nodejs \
    && useradd --system --uid 1001 --gid nodejs nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/node_modules/@prisma ./node_modules/@prisma
# PDF-сертификат: в standalone не попадают шрифты и @react-pdf — без них renderToBuffer падает.
COPY --from=builder --chown=nextjs:nodejs /app/node_modules/dejavu-fonts-ttf ./node_modules/dejavu-fonts-ttf
COPY --from=builder --chown=nextjs:nodejs /app/node_modules/@react-pdf ./node_modules/@react-pdf
# Исходники для `tsx prisma/seed.ts` (импорты `../lib/db`, `./lesson-content`)
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/lib ./lib
COPY --from=builder /app/prisma /tools/prisma
COPY --from=builder /app/package.json /tools/package.json
COPY --from=builder /app/package-lock.json /tools/package-lock.json
COPY --from=builder /app/node_modules /tools/node_modules
COPY docker-entrypoint.sh docker-entrypoint.prod.sh /app/
RUN chmod +x /app/docker-entrypoint.sh /app/docker-entrypoint.prod.sh \
    && chown nextjs:nodejs /app/docker-entrypoint.sh /app/docker-entrypoint.prod.sh \
    && chown -R nextjs:nodejs /tools /app/prisma /app/lib

USER nextjs

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME=0.0.0.0

HEALTHCHECK --interval=20s --timeout=5s --start-period=40s --retries=5 \
  CMD node -e "fetch('http://127.0.0.1:3000/api/health').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"

ENTRYPOINT ["/app/docker-entrypoint.sh"]

# --- One-shot: Prisma migrate (production compose) ---
FROM deps AS migrate
WORKDIR /app
COPY prisma ./prisma
COPY lib/00-init-prisma-env.ts ./lib/00-init-prisma-env.ts
ENV NODE_ENV=production
CMD ["./node_modules/.bin/prisma", "migrate", "deploy"]
