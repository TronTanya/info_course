# Локальный dev-сервер (Windows): подхватывает Node/npm после winget install
$machine = [System.Environment]::GetEnvironmentVariable("Path", "Machine")
$user = [System.Environment]::GetEnvironmentVariable("Path", "User")
$env:Path = "$machine;$user"

Set-Location $PSScriptRoot\..
Write-Host "Node: $(node -v 2>$null)"
Write-Host "npm:  $(npm -v 2>$null)"
npm run dev
