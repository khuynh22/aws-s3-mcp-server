# Example: Upload a file using a presigned PUT URL
# This script demonstrates how to use the presigned PUT URL from the MCP server

param(
    [Parameter(Mandatory=$true)]
    [string]$PresignedUrl,

    [Parameter(Mandatory=$true)]
    [string]$FilePath,

    [Parameter(Mandatory=$false)]
    [string]$ContentType = "application/octet-stream"
)

# Check if file exists
if (-not (Test-Path $FilePath)) {
    Write-Error "File not found: $FilePath"
    exit 1
}

# Get file info
$fileInfo = Get-Item $FilePath
Write-Host "Uploading: $($fileInfo.Name) ($($fileInfo.Length) bytes)"
Write-Host "Content-Type: $ContentType"
Write-Host ""

try {
    # Upload the file
    $response = Invoke-WebRequest `
        -Uri $PresignedUrl `
        -Method PUT `
        -InFile $FilePath `
        -ContentType $ContentType `
        -UseBasicParsing

    if ($response.StatusCode -eq 200) {
        Write-Host "✓ Upload successful!" -ForegroundColor Green
        Write-Host "Status Code: $($response.StatusCode)"
    } else {
        Write-Host "⚠ Unexpected status code: $($response.StatusCode)" -ForegroundColor Yellow
    }
} catch {
    Write-Error "Upload failed: $_"
    exit 1
}

# Example usage:
# 1. First, use Claude or the MCP server to generate a presigned PUT URL:
#    "Generate an upload URL for 'uploads/myfile.txt' in 'my-bucket'"
#
# 2. Then run this script:
#    .\test-upload.ps1 -PresignedUrl "https://..." -FilePath "C:\path\to\file.txt" -ContentType "text/plain"
