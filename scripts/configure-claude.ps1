# Configure Claude Desktop to use this MCP server
# This script helps generate the Claude Desktop configuration

Write-Host "======================================" -ForegroundColor Cyan
Write-Host "  Claude Desktop Configuration" -ForegroundColor Cyan
Write-Host "======================================" -ForegroundColor Cyan
Write-Host ""

# Get the current directory path
$currentPath = (Get-Location).Path
$serverPath = Join-Path $currentPath "dist\index.js"

# Convert to JSON-safe path (escape backslashes)
$jsonPath = $serverPath -replace '\\', '\\'

# Check if server is built
if (-not (Test-Path $serverPath)) {
    Write-Host "✗ Server not built!" -ForegroundColor Red
    Write-Host "Please run: npm run build" -ForegroundColor Yellow
    exit 1
}

Write-Host "Server path: $serverPath" -ForegroundColor White
Write-Host ""

# Generate configuration
$config = @"
{
  "mcpServers": {
    "aws-s3": {
      "command": "node",
      "args": [
        "$jsonPath"
      ]
    }
  }
}
"@

Write-Host "Claude Desktop Configuration:" -ForegroundColor Yellow
Write-Host "------------------------------" -ForegroundColor Gray
Write-Host $config -ForegroundColor Cyan
Write-Host "------------------------------" -ForegroundColor Gray
Write-Host ""

# Determine config file location
$claudeConfigPath = "$env:APPDATA\Claude\claude_desktop_config.json"

Write-Host "Configuration file location:" -ForegroundColor Yellow
Write-Host "  $claudeConfigPath" -ForegroundColor White
Write-Host ""

# Check if config file exists
if (Test-Path $claudeConfigPath) {
    Write-Host "✓ Claude Desktop config file found" -ForegroundColor Green
    Write-Host ""
    Write-Host "⚠ The file already exists. Please:" -ForegroundColor Yellow
    Write-Host "  1. Back up your existing config" -ForegroundColor White
    Write-Host "  2. Open the file:" -ForegroundColor White
    Write-Host "     notepad `"$claudeConfigPath`"" -ForegroundColor Cyan
    Write-Host "  3. Add the 'aws-s3' server configuration above" -ForegroundColor White
    Write-Host "  4. Save and restart Claude Desktop" -ForegroundColor White
} else {
    Write-Host "! Claude Desktop config file not found" -ForegroundColor Yellow
    Write-Host ""

    $response = Read-Host "Create the config file now? (y/n)"

    if ($response -eq 'y' -or $response -eq 'Y') {
        # Create directory if it doesn't exist
        $claudeDir = Split-Path $claudeConfigPath
        if (-not (Test-Path $claudeDir)) {
            New-Item -ItemType Directory -Path $claudeDir -Force | Out-Null
        }

        # Write config
        $config | Out-File -FilePath $claudeConfigPath -Encoding UTF8

        Write-Host ""
        Write-Host "✓ Configuration file created!" -ForegroundColor Green
        Write-Host ""
        Write-Host "Next steps:" -ForegroundColor Yellow
        Write-Host "  1. Restart Claude Desktop" -ForegroundColor White
        Write-Host "  2. Test by asking Claude: 'List my S3 buckets'" -ForegroundColor White
    } else {
        Write-Host ""
        Write-Host "You can manually create the file at:" -ForegroundColor Yellow
        Write-Host "  $claudeConfigPath" -ForegroundColor White
    }
}

Write-Host ""
Write-Host "For detailed instructions, see SETUP_GUIDE.md" -ForegroundColor Yellow
Write-Host ""
