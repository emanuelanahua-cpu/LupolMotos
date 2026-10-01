@echo off
title Lupol Motos - Iniciar todo
echo Instalando dependencias del backend (solo la primera vez tarda)...
cd /d "%~dp0backend"
py -m pip install fastapi uvicorn
echo Encendiendo backend en el puerto 8000...
start "Backend Lupol (no cerrar)" cmd /k py -m uvicorn main:app --port 8000
echo Encendiendo la pagina...
cd /d "%~dp0frontend"
start "Frontend Lupol (no cerrar)" cmd /k npm run dev
timeout /t 6 >nul
start http://localhost:3000/login
