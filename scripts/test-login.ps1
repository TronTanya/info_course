$base = "https://info-course-sigma.vercel.app"
$cookie = Join-Path $PSScriptRoot "..\cookies.txt"
if (Test-Path $cookie) { Remove-Item $cookie -Force }

Push-Location (Split-Path -Parent $PSScriptRoot)
try {
  $csrfJson = npx vercel curl -s -c $cookie "$base/api/auth/csrf" 2>$null
  $csrf = ($csrfJson | ConvertFrom-Json).csrfToken
  Write-Output "csrf=$csrf"

  $body = "csrfToken=$csrf&email=admin%40cyberedu.local&password=Admin12345%21&redirect=false&json=true"
  $login = npx vercel curl -s -i -b $cookie -c $cookie -X POST "$base/api/auth/callback/credentials" `
    -H "Content-Type: application/x-www-form-urlencoded" `
    --data-raw $body 2>$null
  Write-Output $login
} finally {
  Pop-Location
}
