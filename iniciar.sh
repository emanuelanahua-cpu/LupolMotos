#!/usr/bin/env bash
set -e
DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$DIR"
if [ ! -f .env ] && [ ! -f .env.local ]; then
    echo 'Configura primero .env usando .env.example y una base de datos MySQL.'
    exit 1
fi
if [ ! -d backend/node_modules ]; then npm ci --prefix backend --cache /tmp/lupol-npm-cache; fi
if [ ! -d frontend/node_modules ]; then npm ci --prefix frontend --cache /tmp/lupol-npm-cache; fi
if [ -f .env.local ]; then
    npm run db:local
    npm run start:local &
else
    npm run dev &
fi
BACKEND_PID=$!
trap 'kill "$BACKEND_PID" 2>/dev/null || true' EXIT
npm run dev --prefix frontend
