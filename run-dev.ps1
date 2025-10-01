<#
 Script minimal para arrancar Vite sin depender del PATH global.
 Uso:
   powershell -ExecutionPolicy Bypass -File .\run-dev.ps1
#>
$nodeDir = 'C:\Program Files\nodejs'
$nodeExe = Join-Path $nodeDir 'node.exe'
$npmCmd  = Join-Path $nodeDir 'npm.cmd'

if (-not (Test-Path $nodeExe)) { Write-Host "No se encontró node.exe en $nodeDir" -ForegroundColor Red; exit 1 }
if (-not (Test-Path $npmCmd)) { Write-Host "No se encontró npm.cmd en $nodeDir" -ForegroundColor Red; exit 1 }

Write-Host 'Verificando versiones...' -ForegroundColor Cyan
& $nodeExe -v
& $npmCmd -v
if ($LASTEXITCODE -ne 0) { Write-Host 'Error ejecutando npm -v' -ForegroundColor Red; exit 1 }

if (-not (Test-Path 'node_modules')) {
  Write-Host 'Instalando dependencias (npm install)...' -ForegroundColor Yellow
  & $npmCmd install
  if ($LASTEXITCODE -ne 0) { Write-Host 'Fallo en npm install' -ForegroundColor Red; exit 1 }
}

Write-Host 'Iniciando Vite (accesible por red)...' -ForegroundColor Green
& $npmCmd run dev -- --host

