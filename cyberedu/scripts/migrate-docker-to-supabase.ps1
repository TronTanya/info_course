# Migrate CyberEdu data from local Docker Postgres to Supabase.
# Usage (Docker Desktop must be running):
#   cd info_course_push\cyberedu
#   powershell -ExecutionPolicy Bypass -File .\scripts\migrate-docker-to-supabase.ps1
#
# Requires DIRECT_URL in frontend/.env (Supabase session/direct connection, port 5432).
param(
  [switch]$SkipTruncate,
  [switch]$DryRun
)

$ErrorActionPreference = "Stop"
$cyberedu = Split-Path -Parent $PSScriptRoot
$frontend = Join-Path $cyberedu "frontend"
$envFile = Join-Path $frontend ".env"
$backupDir = Join-Path $cyberedu "backups"
$stamp = Get-Date -Format "yyyyMMdd-HHmmss"
$dumpFile = Join-Path $backupDir "docker-data-$stamp.sql"
$truncateFile = Join-Path $backupDir "supabase-truncate-$stamp.sql"

function Read-DotEnv([string]$path) {
  $map = @{}
  Get-Content $path | ForEach-Object {
    if ($_ -match '^\s*([^#=]+)=(.*)$') {
      $map[$matches[1].Trim()] = $matches[2].Trim().Trim('"')
    }
  }
  return $map
}

if (-not (Get-Command docker -ErrorAction SilentlyContinue)) {
  throw "Docker not found in PATH. Start Docker Desktop, then run this script again."
}

if (-not (Test-Path $envFile)) {
  throw "Missing $envFile — set DIRECT_URL to Supabase connection string."
}

$local = Read-DotEnv $envFile
$supabaseUrl = $local.DIRECT_URL
if (-not $supabaseUrl) { $supabaseUrl = $local.DATABASE_URL }
if (-not $supabaseUrl -or $supabaseUrl -notmatch '^postgres(ql)?://') {
  throw "DIRECT_URL in frontend/.env must be a full postgresql:// URI from Supabase Dashboard."
}

New-Item -ItemType Directory -Force -Path $backupDir | Out-Null
Set-Location $cyberedu

Write-Output "Checking local Docker Postgres..."
$pgStatus = docker compose ps postgres --status running -q 2>$null
if (-not $pgStatus) {
  throw @"
Local postgres container is not running.
  cd $cyberedu
  docker compose up -d postgres
Wait until healthy, then run this script again.
"@
}

$userCount = docker compose exec -T postgres psql -U cyberedu -d cyberedu -t -A -c 'SELECT COUNT(*) FROM "User";'
$userCount = ($userCount | Out-String).Trim()
Write-Output "Local Docker: $userCount users in ""User"" table."

if ([int]$userCount -lt 3) {
  Write-Warning "Expected ~266 users. Local DB may be empty — run seed in Docker first:"
  Write-Warning "  docker compose up -d postgres"
  Write-Warning "  docker compose run --rm -e RUN_SEED=1 -e ENVIRONMENT=development frontend npx prisma db seed"
}

Write-Output "Exporting data-only dump from Docker..."
docker compose exec -T postgres pg_dump -U cyberedu -d cyberedu `
  --data-only `
  --disable-triggers `
  --no-owner `
  --no-privileges `
  | Set-Content -Path $dumpFile -Encoding utf8

$dumpSize = (Get-Item $dumpFile).Length
Write-Output "Saved: $dumpFile ($dumpSize bytes)"

@'
-- Clear Supabase app data before import (keeps _prisma_migrations).
SET session_replication_role = replica;
TRUNCATE TABLE
  "TestAttemptAnswer",
  "TestAttempt",
  "Submission",
  "Progress",
  "UserAchievement",
  "Certificate",
  "Review",
  "AiAdaptation",
  tutor_chat_message,
  tutor_chat_thread,
  course_progress,
  security_audit_log,
  "Account",
  "Session",
  "VerificationToken",
  "Profile",
  "User",
  "Answer",
  "Question",
  "Test",
  "PracticalTask",
  "Lesson",
  "Module",
  "Course"
RESTART IDENTITY CASCADE;
SET session_replication_role = DEFAULT;
'@ | Set-Content -Path $truncateFile -Encoding utf8

if ($DryRun) {
  Write-Output "DryRun: export done. Import skipped."
  Write-Output "  truncate: $truncateFile"
  Write-Output "  data:     $dumpFile"
  exit 0
}

if (-not $SkipTruncate) {
  Write-Output "Truncating Supabase tables..."
  Get-Content $truncateFile | docker run --rm -i postgres:16-alpine `
    psql "$supabaseUrl" -v ON_ERROR_STOP=1 2>&1
  if ($LASTEXITCODE -ne 0) { throw "Supabase truncate failed." }
}

Write-Output "Importing data to Supabase (may take 1-3 min)..."
Get-Content $dumpFile | docker run --rm -i postgres:16-alpine `
  psql "$supabaseUrl" -v ON_ERROR_STOP=1 2>&1
if ($LASTEXITCODE -ne 0) { throw "Supabase import failed." }

$remoteCount = docker run --rm -i postgres:16-alpine `
  psql "$supabaseUrl" -t -A -c 'SELECT COUNT(*) FROM "User";' 2>&1
$remoteCount = ($remoteCount | Out-String).Trim()
Write-Output "Done. Supabase now has $remoteCount users."
Write-Output "Refresh admin: https://info-course-sigma.vercel.app/admin/users"
