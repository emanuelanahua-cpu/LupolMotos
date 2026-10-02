#!/usr/bin/env bash
set -e

DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

echo "=== Lupol Motos ==="

# 1. Verificar entorno virtual de Python para el backend
if [ ! -d "$DIR/backend/venv" ]; then
    echo "Configurando entorno de Python para el backend..."
    python3 -m venv "$DIR/backend/venv"
    "$DIR/backend/venv/bin/pip" install fastapi "uvicorn[standard]"
fi

# 2. Iniciar backend
echo "Iniciando backend en http://localhost:8000..."
cd "$DIR/backend"
"$DIR/backend/venv/bin/python" -m uvicorn main:app --port 8000 &
BACKEND_PID=$!

# Limpiar procesos al salir (Ctrl+C)
cleanup() {
    echo ""
    echo "Deteniendo servicios..."
    kill $BACKEND_PID 2>/dev/null || true
    exit 0
}
trap cleanup SIGINT SIGTERM EXIT

# 3. Iniciar frontend
echo "Iniciando frontend en http://localhost:3000..."
cd "$DIR/frontend"

# Intentar abrir el navegador en segundo plano después de 2 segundos
(sleep 2 && (xdg-open http://localhost:3000/login 2>/dev/null || true)) &

npm run dev
