# Start the AWS S3 MCP Server
# This script starts the server with proper environment configuration

Write-Host "======================================" -ForegroundColor Cyan
Write-Host "  Starting AWS S3 MCP Server" -ForegroundColor Cyan
Write-Host "======================================" -ForegroundColor Cyan
Write-Host ""

# Check if built
if (-not (Test-Path "dist/index.js")) {
    Write-Host "✗ Server not built!" -ForegroundColor Red
    Write-Host "Running build first..." -ForegroundColor Yellow
    npm run build
    if ($LASTEXITCODE -ne 0) {
        Write-Host "✗ Build failed!" -ForegroundColor Red
        exit 1
    }
}

# Check if .env exists
if (-not (Test-Path ".env")) {
    Write-Host "⚠ Warning: .env file not found!" -ForegroundColor Yellow
    Write-Host "Make sure AWS credentials are set in environment variables" -ForegroundColor Yellow
    Write-Host ""
}

Write-Host "Server starting..." -ForegroundColor Green
Write-Host "Configuration:" -ForegroundColor Yellow

# Load and display .env if it exists
if (Test-Path ".env") {
    $envContent = Get-Content ".env"
    foreach ($line in $envContent) {
        if ($line -match "^AWS_REGION=(.*)") {
            Write-Host "  Region: $($matches[1])" -ForegroundColor White
        }
        if ($line -match "^ALLOW_WRITE=(.*)") {
            Write-Host "  Write Enabled: $($matches[1])" -ForegroundColor White
        }
    }
}

Write-Host ""
Write-Host "Press Ctrl+C to stop the server" -ForegroundColor Yellow
Write-Host ""
Write-Host "Waiting for MCP client connections..." -ForegroundColor Cyan
Write-Host ""

# Start the server
npm start
