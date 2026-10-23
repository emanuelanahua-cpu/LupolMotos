@echo off
title Lupol Motos
cd /d "%~dp0"
if not exist .env (
  echo Configura primero .env usando .env.example y una base de datos MySQL.
  pause
  exit /b 1
)
call npm ci
if errorlevel 1 exit /b 1
call npm ci --prefix frontend
if errorlevel 1 exit /b 1
start "Backend Lupol" cmd /k npm run dev
call npm run dev --prefix frontend
