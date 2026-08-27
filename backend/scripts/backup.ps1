Param(
  [string]$OutputDir = "backups",
  [string]$DbUrl = $env:DATABASE_URL
)

if (-not $DbUrl) {
  # Try to load DATABASE_URL from backend/.env if present
  $envFile = Join-Path $PSScriptRoot "..\.env"
  if (Test-Path $envFile) {
    $lines = Get-Content $envFile | ForEach-Object { $_.Trim() } | Where-Object { $_ -and -not $_.StartsWith('#') }
    $dbLine = $lines | Where-Object { $_ -match '^DATABASE_URL\s*=' } | Select-Object -First 1
    if ($dbLine) {
      $parts = $dbLine -split '=', 2
      if ($parts.Length -ge 2) {
        $DbUrl = $parts[1].Trim().Trim('"')
      }
    }
  }
  if (-not $DbUrl) {
    Write-Error "DATABASE_URL must be set in environment or defined in backend/.env"
    exit 1
  }
}

# Parse DATABASE_URL like: postgresql://user:pass@host:port/dbname
$uri = [System.Uri]::new($DbUrl.Replace('postgresql://','http://'))
$userInfo = $uri.UserInfo.Split(':')
$dbUser = $userInfo[0]
$dbPass = $userInfo[1]
$dbHost = $uri.Host
$dbPort = $uri.Port
$dbName = $uri.AbsolutePath.TrimStart('/')

if (-not (Test-Path $OutputDir)) { New-Item -ItemType Directory -Path $OutputDir | Out-Null }

$timestamp = (Get-Date).ToString('yyyyMMdd_HHmmss')
$out = Join-Path $OutputDir "${db}_backup_${timestamp}.sql"

$env:PGPASSWORD = $dbPass

if (-not (Get-Command pg_dump -ErrorAction SilentlyContinue)) {
  Write-Error "pg_dump not found in PATH. Install PostgreSQL client tools or add pg_dump to PATH."
  exit 1
}

$cmd = "pg_dump -U $dbUser -h $dbHost -p $dbPort -F c -b -v -f `"$out`" $dbName"
Write-Output "Running: $cmd"
Invoke-Expression $cmd

if ($LASTEXITCODE -ne 0) { Write-Error 'pg_dump failed' ; exit $LASTEXITCODE }

Write-Output "Backup saved to $out"
