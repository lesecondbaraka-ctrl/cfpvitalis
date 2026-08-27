$ErrorActionPreference = 'Stop'

Write-Host 'Vérification de la base locale...' -ForegroundColor Green

try {
  $conn = New-Object System.Data.Odbc.OdbcConnection('Driver={PostgreSQL ANSI};Server=localhost;Port=5432;Database=postgres;Uid=postgres;Pwd=postgres;')
  $conn.Open()
  Write-Host 'Connexion PostgreSQL OK' -ForegroundColor Green
  $conn.Close()
} catch {
  Write-Host "Connexion PostgreSQL impossible: $($_.Exception.Message)" -ForegroundColor Yellow
  exit 1
}

Write-Host 'Exécution de Prisma migrate...' -ForegroundColor Green
& npx prisma migrate deploy

Write-Host 'Exécution de Prisma generate...' -ForegroundColor Green
& npx prisma generate

Write-Host 'Build backend...' -ForegroundColor Green
& npm run build
