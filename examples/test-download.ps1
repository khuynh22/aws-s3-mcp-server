# Example: Download a file using a presigned GET URL
# This script demonstrates how to use the presigned GET URL from the MCP server

param(
    [Parameter(Mandatory=$true)]
    [string]$PresignedUrl,

    [Parameter(Mandatory=$true)]
    [string]$OutputPath
)

# Get output directory
$outputDir = Split-Path -Parent $OutputPath
if ($outputDir -and -not (Test-Path $outputDir)) {
    New-Item -ItemType Directory -Path $outputDir -Force | Out-Null
}

Write-Host "Downloading to: $OutputPath"
Write-Host ""

try {
    # Download the file
    Invoke-WebRequest `
        -Uri $PresignedUrl `
        -OutFile $OutputPath `
        -UseBasicParsing

    $fileInfo = Get-Item $OutputPath
    Write-Host "✓ Download successful!" -ForegroundColor Green
    Write-Host "File size: $($fileInfo.Length) bytes"
    Write-Host "Saved to: $($fileInfo.FullName)"
} catch {
    Write-Error "Download failed: $_"
    exit 1
}

# Example usage:
# 1. First, use Claude or the MCP server to generate a presigned GET URL:
#    "Give me a download link for 'data/report.pdf' in 'my-bucket'"
#
# 2. Then run this script:
#    .\test-download.ps1 -PresignedUrl "https://..." -OutputPath "C:\Downloads\report.pdf"
