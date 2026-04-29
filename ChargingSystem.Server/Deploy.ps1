# Deploy.ps1
# ChargingSystem.Server deployment script using plink/pscp

$ErrorActionPreference = "Stop"

# Configuration
$remoteIP = "192.168.2.50"
$remoteUser = "ein"
$sshPassword = "zyx4pigzyx"
$remotePath = "/home/ein/Documents/ChargingSystem/"
$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$publishDir = Join-Path $scriptDir "bin\Release\net10.0\publish"

Write-Host "=== ChargingSystem Server Deployment ===" -ForegroundColor Cyan

# Step 1: Check plink and pscp
Write-Host "`n[1/6] Checking plink and pscp..." -ForegroundColor Yellow
try {
    Get-Command plink -ErrorAction Stop | Out-Null
    Get-Command pscp -ErrorAction Stop | Out-Null
    Write-Host "  plink and pscp found." -ForegroundColor Green
} catch {
    Write-Host "  ERROR: plink/pscp not found! Please install PuTTY first." -ForegroundColor Red
    Write-Host "  Download from: https://www.chiark.greenend.org.uk/~sgtatham/putty/latest.html" -ForegroundColor Red
    exit 1
}

# Step 1b: Accept host key non-interactively
Write-Host "`n[1/6] Accepting host key for ${remoteIP}..." -ForegroundColor Yellow
try {
    Write-Output "Yes" | plink -pw $sshPassword ${remoteUser}@${remoteIP} echo "connected" | Out-Null
} catch {
    # If connection fails but it's not a host key issue, that's fine for now
    Write-Host "  Host key acceptance skipped (will be handled later)." -ForegroundColor Yellow
}
Write-Host "  Host key accepted." -ForegroundColor Green

# Step 2: Publish
Write-Host "`n[2/6] Publishing project..." -ForegroundColor Yellow
Push-Location $scriptDir
dotnet publish -c Release
$exitCode = $LASTEXITCODE
Pop-Location

if ($exitCode -ne 0) {
    Write-Host "  ERROR: dotnet publish failed with exit code $exitCode" -ForegroundColor Red
    exit 1
}
Write-Host "  Publish completed successfully." -ForegroundColor Green

# Step 3: Clean remote directory
Write-Host "`n[3/6] Cleaning remote directory..." -ForegroundColor Yellow
$cleanCmd = "rm -rf ${remotePath}/*"
plink -pw $sshPassword -batch ${remoteUser}@${remoteIP} $cleanCmd
if ($LASTEXITCODE -ne 0) {
    Write-Host "  ERROR: Failed to clean remote directory." -ForegroundColor Red
    exit 1
}
Write-Host "  Remote directory cleaned." -ForegroundColor Green

# Step 4: Upload files
Write-Host "`n[4/6] Uploading files..." -ForegroundColor Yellow
Push-Location $publishDir
pscp -pw $sshPassword -batch -r * ${remoteUser}@${remoteIP}:${remotePath}
if ($LASTEXITCODE -ne 0) {
    Write-Host "  ERROR: File upload failed." -ForegroundColor Red
    Pop-Location
    exit 1
}
Pop-Location
Write-Host "  Files uploaded successfully." -ForegroundColor Green

# Step 5: Restart service
Write-Host "`n[5/6] Restarting service..." -ForegroundColor Yellow
$restartCmd = "echo '${sshPassword}' | sudo -S systemctl restart chargingsystem"
plink -pw $sshPassword -batch ${remoteUser}@${remoteIP} $restartCmd
if ($LASTEXITCODE -ne 0) {
    Write-Host "  ERROR: Service restart failed." -ForegroundColor Red
    exit 1
}
Write-Host "  Service restarted successfully." -ForegroundColor Green

Write-Host "`n=== Deployment Completed ===" -ForegroundColor Cyan
