# Повторный запуск prisma db seed (нестабильный pooler с Windows).
$ErrorActionPreference = "Stop"
$env:Path = [System.Environment]::GetEnvironmentVariable("Path", "Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path", "User")
Set-Location $PSScriptRoot + "\.."

$pwd = "xxXX1234%21%2F%2122"
$base = "postgresql://postgres.vxihebmodvatwmiasvzp:${pwd}@aws-0-eu-west-1.pooler.supabase.com"
$env:DATABASE_URL = "${base}:6543/postgres?pgbouncer=true&connect_timeout=60&sslmode=require&uselibpqcompat=true"
$env:DIRECT_URL = "${base}:5432/postgres?schema=public&connect_timeout=60&sslmode=require&uselibpqcompat=true"

$max = 5
for ($i = 1; $i -le $max; $i++) {
  Write-Host "=== Попытка seed $i / $max ===" -ForegroundColor Cyan
  npx prisma db seed
  if ($LASTEXITCODE -eq 0) {
    Write-Host "Seed успешно завершён." -ForegroundColor Green
    exit 0
  }
  Start-Sleep -Seconds 8
}
Write-Host "Seed не удался после $max попыток. Используйте: npm run seed:remote" -ForegroundColor Yellow
exit 1
