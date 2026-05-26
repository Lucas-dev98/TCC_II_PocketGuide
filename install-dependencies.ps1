$ErrorActionPreference = "Stop"

$repoRoot = Split-Path -Parent $MyInvocation.MyCommand.Path

function Resolve-NpmCommand {
  $npmCmd = Get-Command npm.cmd -ErrorAction SilentlyContinue
  if ($npmCmd) { return $npmCmd.Source }

  $npm = Get-Command npm -ErrorAction SilentlyContinue
  if ($npm) { return $npm.Source }

  $knownPath = "C:\Program Files\nodejs\npm.cmd"
  if (Test-Path $knownPath) { return $knownPath }

  throw "npm was not found. Install Node.js 18+ and ensure npm is available."
}

function Ensure-GoAvailable {
  $go = Get-Command go -ErrorAction SilentlyContinue
  if (-not $go) {
    throw "Go was not found. Install Go 1.23+ and ensure go is in PATH."
  }
}

$npmCommand = Resolve-NpmCommand

Write-Host "[1/3] Installing root dependencies..." -ForegroundColor Cyan
Push-Location $repoRoot
& $npmCommand install
Pop-Location

Write-Host "[2/3] Installing web dependencies (pocket-guide-web)..." -ForegroundColor Cyan
Push-Location (Join-Path $repoRoot "pocket-guide-web")
& $npmCommand install
Pop-Location

Write-Host "[3/3] Downloading backend dependencies (pocket-guide-backend)..." -ForegroundColor Cyan
Ensure-GoAvailable
Push-Location (Join-Path $repoRoot "pocket-guide-backend")
go mod download
Pop-Location

Write-Host "Done. All project dependencies were installed." -ForegroundColor Green
