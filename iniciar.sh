#!/usr/bin/env bash
set -e
DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$DIR"
if [ ! -f .env ]; then
    echo 'Configura primero .env usando .env.example y una base de datos MySQL.'
    exit 1
fi
if [ ! -d node_modules ]; then npm ci --cache /tmp/lupol-npm-cache; fi
if [ ! -d frontend/node_modules ]; then npm ci --prefix frontend --cache /tmp/lupol-npm-cache; fi
npm run dev &
BACKEND_PID=$!
trap 'kill "$BACKEND_PID" 2>/dev/null || true' EXIT
npm run dev --prefix frontend
