#!/bin/sh
set -e
cd /tools
echo "[cyberedu] prisma migrate deploy..."
./node_modules/.bin/prisma migrate deploy
cd /app
echo "[cyberedu] seed..."
NODE_PATH=/tools/node_modules /tools/node_modules/.bin/tsx prisma/seed.ts
echo "[cyberedu] starting app..."
exec node server.js
