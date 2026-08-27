$ErrorActionPreference = 'Stop'

if (-not (Get-Command choco -ErrorAction SilentlyContinue)) {
  Write-Host 'Chocolatey n''est pas installé. Installez-le d''abord depuis https://chocolatey.org/' -ForegroundColor Yellow
  exit 1
}

choco install postgresql15 --params '/Password:postgres' -y

Write-Host 'Installation terminée. Redémarrez PowerShell, puis relancez :' -ForegroundColor Green
Write-Host 'pwsh -NoProfile -ExecutionPolicy Bypass -File .\scripts\start-local-db.ps1' -ForegroundColor Cyan
