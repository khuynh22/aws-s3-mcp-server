# Test AWS connection and verify credentials
# This script checks if AWS credentials are properly configured

Write-Host "======================================" -ForegroundColor Cyan
Write-Host "  AWS Connection Test" -ForegroundColor Cyan
Write-Host "======================================" -ForegroundColor Cyan
Write-Host ""

# Check if .env file exists
if (-not (Test-Path ".env")) {
    Write-Host " .env file not found!" -ForegroundColor Red
    Write-Host "Please run setup.ps1 first or copy .env.example to .env" -ForegroundColor Yellow
    exit 1
}

Write-Host "Testing AWS connection..." -ForegroundColor Yellow
Write-Host ""

# Run the quick test
node examples/quick-test.js

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "======================================" -ForegroundColor Cyan
    Write-Host "   AWS Connection Successful!" -ForegroundColor Green
    Write-Host "======================================" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "You are ready to use the MCP server!" -ForegroundColor Green
    Write-Host ""
    Write-Host "To configure Claude Desktop:" -ForegroundColor Yellow
    Write-Host "  1. Edit: %APPDATA%\Claude\claude_desktop_config.json" -ForegroundColor White
    Write-Host "  2. Add the server configuration (see SETUP_GUIDE.md)" -ForegroundColor White
    Write-Host "  3. Restart Claude Desktop" -ForegroundColor White
    Write-Host ""
} else {
    Write-Host ""
    Write-Host "======================================" -ForegroundColor Cyan
    Write-Host "   AWS Connection Failed" -ForegroundColor Red
    Write-Host "======================================" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Please check:" -ForegroundColor Yellow
    Write-Host "  1. AWS credentials in .env file are correct" -ForegroundColor White
    Write-Host "  2. AWS_REGION is set properly" -ForegroundColor White
    Write-Host "  3. IAM user has S3 permissions" -ForegroundColor White
    Write-Host ""
    Write-Host "See SETUP_GUIDE.md for detailed troubleshooting" -ForegroundColor Yellow
    Write-Host ""
    exit 1
}
