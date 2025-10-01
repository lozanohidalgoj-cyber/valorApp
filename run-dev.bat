@echo off
SETLOCAL
set NODEDIR=C:\Program Files\nodejs
set NODEEXE="%NODEDIR%\node.exe"
set NPMCMD="%NODEDIR%\npm.cmd"

if not exist %NODEEXE% (
  echo No se encontro node.exe en %NODEDIR%
  exit /b 1
)
if not exist %NPMCMD% (
  echo No se encontro npm.cmd en %NODEDIR%
  exit /b 1
)

echo Verificando versiones...
%NODEEXE% -v
%NPMCMD% -v
if errorlevel 1 exit /b 1

if not exist node_modules (
  echo Instalando dependencias (npm install)...
  %NPMCMD% install
  if errorlevel 1 exit /b 1
)

echo Iniciando Vite (--host)...
%NPMCMD% run dev -- --host
ENDLOCAL
