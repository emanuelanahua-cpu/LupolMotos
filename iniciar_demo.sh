#!/bin/bash

echo "=================================================="
echo "    INICIANDO DEMO WEB - LUPOL MOTOS TACNA    "
echo "=================================================="
echo "Backend: Python FastAPI (Puerto 8000)"
echo "Frontend: React + Tailwind CSS (Vite / SPA)"
echo "Color de Énfasis: #fad911 (Lupol Yellow)"
echo "=================================================="

cd "$(dirname "$0")"
./backend/venv/bin/uvicorn backend.main:app --host 0.0.0.0 --port 8000 --reload
