$ErrorActionPreference = 'Continue'
$batchesDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$manifest = Get-Content (Join-Path $batchesDir 'manifest.json') -Raw | ConvertFrom-Json
$startIdx = if ($args.Count -ge 1) { [int]$args[0] } else { 0 }
$endIdx = if ($args.Count -ge 2) { [int]$args[1] } else { $manifest.Count - 1 }
$workDir = Resolve-Path (Join-Path $batchesDir '..\..\..')
$ok = 0
$skipped = 0

function Transform-Sql([string]$sql, [string]$filename) {
  if ($filename -notmatch 'Question') { return $sql }
  if ($sql -notmatch '"topic"') { return $sql }
  $out = $sql -replace 'INSERT INTO "Question" \("id", "testId", "questionText", "questionType", "points", "orderNumber", "textExpectedAnswer", "textManualGrading", "explanation", "topic"\)', 'INSERT INTO "Question" ("id", "testId", "questionText", "questionType", "points", "orderNumber", "textExpectedAnswer", "textManualGrading", "explanation")'
  $out = $out -replace ', NULL\)', ')'
  return $out
}

function Is-DuplicateError([string]$text) {
  return $text -match 'duplicate key|23505|already exists|unique constraint'
}

Push-Location $workDir
for ($i = $startIdx; $i -le $endIdx -and $i -lt $manifest.Count; $i++) {
  $file = $manifest[$i]
  $path = Join-Path $batchesDir $file
  $sql = Get-Content $path -Raw -Encoding UTF8
  $sql = Transform-Sql $sql $file
  $tmp = Join-Path $batchesDir "_run.sql"
  [System.IO.File]::WriteAllText($tmp, $sql, [System.Text.UTF8Encoding]::new($false))

  $output = & supabase db query --linked -f $tmp 2>&1 | Out-String
  $code = $LASTEXITCODE

  if ($code -eq 0) {
    $ok++
    if ((($i + 1) % 25) -eq 0) { Write-Host "Progress: $($i+1)/$($manifest.Count) $file" }
  } elseif (Is-DuplicateError $output) {
    $skipped++
    Write-Host "SKIP duplicate $file"
  } else {
    Write-Host "FAILED $file"
    Write-Host $output
    Pop-Location
    exit 1
  }
}
Pop-Location
Write-Host "Done: ok=$ok skipped=$skipped range=$startIdx-$endIdx total=$($ok+$skipped)"
