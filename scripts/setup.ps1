# Quick setup script for AWS S3 MCP Server
Write-Host "======================================" -ForegroundColor Cyan
Write-Host "  AWS S3 MCP Server - Quick Setup" -ForegroundColor Cyan
Write-Host "======================================" -ForegroundColor Cyan
Write-Host ""

# Check Node.js
Write-Host "Checking Node.js installation..." -ForegroundColor Yellow
if (Get-Command node -ErrorAction SilentlyContinue) {
    $nodeVersion = node --version
    Write-Host "   Node.js found: $nodeVersion" -ForegroundColor Green
} else {
    Write-Host "   Node.js not found!" -ForegroundColor Red
    Write-Host "  Please install Node.js from https://nodejs.org/" -ForegroundColor Red
    exit 1
}

# Check npm
Write-Host "Checking npm installation..." -ForegroundColor Yellow
if (Get-Command npm -ErrorAction SilentlyContinue) {
    $npmVersion = npm --version
    Write-Host "   npm found: v$npmVersion" -ForegroundColor Green
} else {
    Write-Host "   npm not found!" -ForegroundColor Red
    exit 1
}

Write-Host ""

# Install dependencies
Write-Host "Installing dependencies..." -ForegroundColor Yellow
npm install
if ($LASTEXITCODE -ne 0) {
    Write-Host "   Failed to install dependencies" -ForegroundColor Red
    exit 1
}
Write-Host "   Dependencies installed" -ForegroundColor Green
Write-Host ""

# Build project
Write-Host "Building project..." -ForegroundColor Yellow
npm run build
if ($LASTEXITCODE -ne 0) {
    Write-Host "   Failed to build project" -ForegroundColor Red
    exit 1
}
Write-Host "   Project built successfully" -ForegroundColor Green
Write-Host ""

# Check for .env file
Write-Host "Checking environment configuration..." -ForegroundColor Yellow
if (Test-Path ".env") {
    Write-Host "   .env file found" -ForegroundColor Green
} elseif (Test-Path ".env.example") {
    Write-Host "  ! .env file not found" -ForegroundColor Yellow
    Write-Host "  Creating .env from template..." -ForegroundColor Yellow
    Copy-Item ".env.example" ".env"
    Write-Host "   .env file created" -ForegroundColor Green
    Write-Host ""
    Write-Host "   IMPORTANT: Edit .env file and add your AWS credentials!" -ForegroundColor Yellow
    Write-Host "    - AWS_ACCESS_KEY_ID" -ForegroundColor Yellow
    Write-Host "    - AWS_SECRET_ACCESS_KEY" -ForegroundColor Yellow
    Write-Host "    - AWS_REGION" -ForegroundColor Yellow
} else {
    Write-Host "   .env.example not found!" -ForegroundColor Red
}

Write-Host ""
Write-Host "======================================" -ForegroundColor Cyan
Write-Host "  Setup Complete!" -ForegroundColor Green
Write-Host "======================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host ""
Write-Host "1. Configure AWS credentials in .env file:" -ForegroundColor White
Write-Host "   notepad .env" -ForegroundColor Cyan
Write-Host ""
Write-Host "2. Test AWS connection:" -ForegroundColor White
Write-Host "   node examples/quick-test.js" -ForegroundColor Cyan
Write-Host ""
Write-Host "3. Configure Claude Desktop:" -ForegroundColor White
Write-Host "   See SETUP_GUIDE.md for instructions" -ForegroundColor Cyan
Write-Host ""
Write-Host "4. Start using with Claude:" -ForegroundColor White
Write-Host "   Ask Claude: 'List my S3 buckets'" -ForegroundColor Cyan
Write-Host ""
Write-Host "For detailed documentation:" -ForegroundColor Yellow
Write-Host "  - SETUP_GUIDE.md  (installation & configuration)" -ForegroundColor White
Write-Host "  - USAGE_GUIDE.md  (examples & how-to)" -ForegroundColor White
Write-Host ""
