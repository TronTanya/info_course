# Restore deploy/db/docker-demo-data.sql to Supabase.
param([switch]$SkipTruncate)

$ErrorActionPreference = "Stop"
$cyberedu = Split-Path -Parent $PSScriptRoot
$frontend = Join-Path $cyberedu "frontend"
$envFile = Join-Path $frontend ".env"
$sqlFile = Join-Path $cyberedu "deploy\db\docker-demo-data.sql"
$truncateFile = Join-Path $cyberedu "deploy\db\supabase-truncate.sql"

if (-not (Test-Path $sqlFile)) {
  throw "Missing sql dump. Run: git pull origin main"
}
if (-not (Test-Path $envFile)) {
  throw "Missing frontend/.env with DIRECT_URL"
}
if (-not (Get-Command docker -ErrorAction SilentlyContinue)) {
  throw "Docker not found. Install Docker Desktop to run psql import."
}

function Read-DotEnv([string]$path) {
  $map = @{}
  Get-Content $path | ForEach-Object {
    if ($_ -match '^\s*([^#=]+)=(.*)$') {
      $map[$matches[1].Trim()] = $matches[2].Trim().Trim('"')
    }
  }
  return $map
}

$local = Read-DotEnv $envFile
$url = $local.DIRECT_URL
if (-not $url) { $url = $local.DATABASE_URL }
if (-not $url -or $url -notmatch '^postgres(ql)?://') {
  throw "DIRECT_URL must start with postgresql://"
}

@'
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

Write-Output "Importing $sqlFile to Supabase..."

if (-not $SkipTruncate) {
  Write-Output "Truncating Supabase..."
  Get-Content $truncateFile | docker run --rm -i postgres:16-alpine psql "$url" -v ON_ERROR_STOP=1
  if ($LASTEXITCODE -ne 0) { throw "Truncate failed." }
}

Get-Content $sqlFile | docker run --rm -i postgres:16-alpine psql "$url" -v ON_ERROR_STOP=1
if ($LASTEXITCODE -ne 0) { throw "Import failed." }

$count = docker run --rm -i postgres:16-alpine psql "$url" -t -A -c 'SELECT COUNT(*) FROM "User";'
Write-Output "Users in Supabase: $(($count | Out-String).Trim())"
