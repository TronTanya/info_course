# Sync production env vars on Vercel from cyberedu/frontend/.env (non-interactive).
$ErrorActionPreference = "Stop"
$root = Split-Path -Parent $PSScriptRoot
$envFile = Join-Path $root "cyberedu\frontend\.env"
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
$prodUrl = "https://info-course-sigma.vercel.app"
$authSecret = if ($local.AUTH_SECRET -and $local.AUTH_SECRET.Length -ge 32) {
  $local.AUTH_SECRET
} else {
  [Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Maximum 256 }))
}

$dbUrl = $local.DATABASE_URL
if ($dbUrl -notmatch "connection_limit=") {
  $sep = if ($dbUrl -match "\?") { "&" } else { "?" }
  $dbUrl = "$dbUrl${sep}connection_limit=1"
} else {
  $dbUrl = $dbUrl -replace "connection_limit=\d+", "connection_limit=1"
}

$updates = [ordered]@{
  DATABASE_URL                         = $dbUrl
  DIRECT_URL                           = $local.DIRECT_URL
  AUTH_SECRET                          = $authSecret
  NEXTAUTH_SECRET                      = $authSecret
  AUTH_URL                             = $prodUrl
  NEXT_PUBLIC_APP_URL                  = $prodUrl
  NEXTAUTH_URL                         = $prodUrl
  ENVIRONMENT                          = "production"
  TRUSTED_PROXY                        = "1"
  NEXT_PUBLIC_SUPABASE_URL             = $local.NEXT_PUBLIC_SUPABASE_URL
  NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY = $local.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
}

Set-Location $root
foreach ($entry in $updates.GetEnumerator()) {
  Write-Output "Updating $($entry.Key)..."
  npx vercel env update $entry.Key production --value $entry.Value --yes --sensitive 2>&1 | Out-Null
  if ($LASTEXITCODE -ne 0) {
    npx vercel env add $entry.Key production --value $entry.Value --yes --sensitive 2>&1 | Out-Null
  }
}

Write-Output "Done. Redeploy with: npx vercel deploy --prod"
