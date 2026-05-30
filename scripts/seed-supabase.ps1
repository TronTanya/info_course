# Load 266 demo users into Supabase using cyberedu/frontend/.env
$ErrorActionPreference = "Stop"
$root = Split-Path -Parent $PSScriptRoot
$frontend = Join-Path $root "cyberedu\frontend"
$envFile = Join-Path $frontend ".env"

if (-not (Test-Path $envFile)) {
  throw "Missing $envFile"
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
$direct = $local.DIRECT_URL
if (-not $direct) { $direct = $local.DATABASE_URL }
if (-not $direct -or $direct -notmatch '^postgres(ql)?://') {
  throw "DIRECT_URL in .env must start with postgresql:// (copy URI from Supabase Dashboard, not placeholder text)"
}

if ($direct -notmatch 'connection_limit=') {
  $sep = if ($direct -match '\?') { '&' } else { '?' }
  $direct = "$direct${sep}connection_limit=1"
}
if ($direct -notmatch 'connect_timeout=') {
  $direct = "$direct&connect_timeout=60"
}

$env:DATABASE_URL = $direct
$env:DIRECT_URL = $direct
$env:ENVIRONMENT = "development"
Remove-Item Env:RUN_SEED -ErrorAction SilentlyContinue

Write-Output "Running prisma seed against Supabase (2-5 min)..."
Set-Location $frontend
npm run seed
