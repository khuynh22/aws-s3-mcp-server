# Examples

This directory contains example scripts for testing and using the AWS S3 MCP Server.

## Quick Test Script

**File:** `quick-test.js`

Tests your AWS connection and lists buckets/objects.

```bash
node quick-test.js
```

**What it does:**
1. Verifies AWS credentials from `.env` file
2. Lists all S3 buckets
3. Lists objects in the first bucket
4. Generates a presigned URL for the first object
5. Reports success/failure

**Use this to:**
- Verify AWS credentials are correct
- Test IAM permissions
- Confirm S3 access before using with Claude

## Upload Example

**File:** `test-upload.ps1` (PowerShell)

Uploads a file using a presigned PUT URL.

```powershell
# Step 1: Get presigned URL from Claude
# Ask Claude: "Generate an upload URL for 'uploads/myfile.txt' in 'my-bucket'"

# Step 2: Upload the file
.\test-upload.ps1 `
  -PresignedUrl "https://your-presigned-url" `
  -FilePath "C:\path\to\file.txt" `
  -ContentType "text/plain"
```

**Parameters:**
- `PresignedUrl`: The URL from the MCP server
- `FilePath`: Local file to upload
- `ContentType`: MIME type (optional)

**Common Content Types:**
- Text: `text/plain`
- JSON: `application/json`
- CSV: `text/csv`
- PDF: `application/pdf`
- Images: `image/png`, `image/jpeg`

## Download Example

**File:** `test-download.ps1` (PowerShell)

Downloads a file using a presigned GET URL.

```powershell
# Step 1: Get presigned URL from Claude
# Ask Claude: "Give me a download link for 'data/report.pdf' in 'my-bucket'"

# Step 2: Download the file
.\test-download.ps1 `
  -PresignedUrl "https://your-presigned-url" `
  -OutputPath "C:\Downloads\report.pdf"
```

**Parameters:**
- `PresignedUrl`: The URL from the MCP server
- `OutputPath`: Where to save the downloaded file

## Complete Workflow Example

### 1. List Buckets

Ask Claude:
```
What S3 buckets do I have?
```

Claude will use `s3_list_buckets` and show your buckets.

### 2. Browse Files

Ask Claude:
```
Show me all files in my-data-bucket with prefix 'reports/2024/'
```

Claude will use `s3_list_objects` with filtering.

### 3. Download a File

Ask Claude:
```
Give me a download link for 'reports/2024/sales.pdf' in 'my-data-bucket' that lasts 2 hours
```

Claude will use `s3_presign_get` and provide the URL.

Then download:
```powershell
.\test-download.ps1 `
  -PresignedUrl "URL_FROM_CLAUDE" `
  -OutputPath "C:\Downloads\sales.pdf"
```

### 4. Upload a File (if ALLOW_WRITE=true)

Ask Claude:
```
Generate an upload URL for 'reports/2024/new-report.pdf' in 'my-data-bucket'
```

Claude will use `s3_presign_put` and provide the URL.

Then upload:
```powershell
.\test-upload.ps1 `
  -PresignedUrl "URL_FROM_CLAUDE" `
  -FilePath "C:\Documents\new-report.pdf" `
  -ContentType "application/pdf"
```

## Using with cURL (Cross-platform)

### Download

```bash
curl -o output.pdf "PRESIGNED_GET_URL"
```

### Upload

```bash
curl -X PUT -T file.pdf -H "Content-Type: application/pdf" "PRESIGNED_PUT_URL"
```

## Using with Python

### Download

```python
import requests

url = "PRESIGNED_GET_URL"
response = requests.get(url)

with open('output.pdf', 'wb') as f:
    f.write(response.content)

print(f"Downloaded {len(response.content)} bytes")
```

### Upload

```python
import requests

url = "PRESIGNED_PUT_URL"

with open('file.pdf', 'rb') as f:
    response = requests.put(
        url,
        data=f,
        headers={'Content-Type': 'application/pdf'}
    )

print(f"Upload status: {response.status_code}")
```

## Tips

- **URL Expiration:** Presigned URLs expire (default: 1 hour, max: 7 days)
- **Content Type:** Always specify when uploading to avoid issues
- **Large Files:** For files >100MB, consider multipart upload
- **Security:** Never share presigned URLs publicly
- **Testing:** Use `quick-test.js` to verify setup before using examples

## Next Steps

- See [USAGE_GUIDE.md](../USAGE_GUIDE.md) for more examples with Claude
- Read [SETUP_GUIDE.md](../SETUP_GUIDE.md) for configuration help
