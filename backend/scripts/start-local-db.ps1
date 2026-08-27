$ErrorActionPreference = 'Stop'

$pgData = Join-Path $PSScriptRoot '..\..\postgres-data'
$pgBin = "$env:ProgramFiles\PostgreSQL\15\bin"

if (-not (Test-Path $pgBin)) {
  Write-Host 'PostgreSQL 15 n''est pas installé. Installez PostgreSQL localement puis relancez ce script.' -ForegroundColor Yellow
  exit 1
}

if (-not (Test-Path $pgData)) {
  New-Item -ItemType Directory -Path $pgData -Force | Out-Null
}

$env:PGDATA = $pgData
$env:PATH = "$pgBin;$env:PATH"

if (-not (Test-Path (Join-Path $pgData 'PG_VERSION'))) {
  & "$pgBin\initdb.exe" -D $pgData -U postgres --auth=trust | Out-Host
}

& "$pgBin\pg_ctl.exe" -D $pgData -l "$pgData\logfile" start | Out-Host

Write-Host 'Base locale prête. Utilisez la connexion:' -ForegroundColor Green
Write-Host 'postgresql://postgres@localhost:5432/postgres' -ForegroundColor Cyan
