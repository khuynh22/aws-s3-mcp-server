# AWS S3 MCP Server - Usage Guide

This guide will walk you through using the AWS S3 MCP Server with Claude Desktop and other MCP clients.

## Table of Contents
- [Configuration](#configuration)
- [Available Tools & Examples](#available-tools--examples)
- [Common Use Cases](#common-use-cases)
- [Tips & Best Practices](#tips--best-practices)

## Configuration

### For Claude Desktop

Edit your Claude Desktop config file:
- **Windows:** `%APPDATA%\Claude\claude_desktop_config.json`
- **Mac:** `~/Library/Application Support/Claude/claude_desktop_config.json`
- **Linux:** `~/.config/Claude/claude_desktop_config.json`

Add this configuration:

```json
{
  "mcpServers": {
    "aws-s3": {
      "command": "node",
      "args": ["/absolute/path/to/aws-s3-mcp-server/dist/index.js"]
    }
  }
}
```

### For VS Code (Copilot Chat)

Edit `~/.vscode/mcp.json`:

```json
{
  "servers": {
    "aws-s3": {
      "type": "stdio",
      "command": "node",
      "args": ["/absolute/path/to/aws-s3-mcp-server/dist/index.js"]
    }
  }
}
```

Then reload VS Code: `Ctrl+Shift+P` → "Developer: Reload Window"

**Note:** The server automatically loads AWS credentials from the `.env` file in your project root.

---

## Available Tools & Examples

### 1. List All S3 Buckets

**Tool:** `s3_list_buckets`

**Example prompts for Claude:**
- "Show me all my S3 buckets"
- "What buckets do I have in AWS S3?"
- "List my S3 buckets"

**Response format:**
```json
[
  {
    "name": "my-data-bucket",
    "creationDate": "2024-01-15T10:30:00.000Z"
  },
  {
    "name": "my-website-bucket",
    "creationDate": "2024-02-01T14:20:00.000Z"
  }
]
```

### 2. List Objects in a Bucket

**Tool:** `s3_list_objects`

**Example prompts for Claude:**
- "Show me all files in the bucket 'my-data-bucket'"
- "List objects in 'my-website-bucket' with prefix 'images/'"
- "What's in the 'logs/' folder of 'my-data-bucket'?"
- "Show me the first 50 files in 'my-bucket'"

**Response format:**
```json
{
  "objects": [
    {
      "key": "images/logo.png",
      "size": 15234,
      "lastModified": "2024-03-10T09:15:00.000Z",
      "etag": "\"d41d8cd98f00b204e9800998ecf8427e\""
    }
  ],
  "isTruncated": false,
  "keyCount": 1
}
```

**Parameters:**
- `bucket`: (required) The bucket name
- `prefix`: (optional) Filter by prefix (e.g., "images/" or "logs/2024/")
- `maxKeys`: (optional) Limit results (1-1000)

### 3. Generate Download URL

**Tool:** `s3_presign_get`

**Example prompts for Claude:**
- "Give me a download link for 'report.pdf' in 'my-docs-bucket'"
- "Create a presigned URL for 'images/photo.jpg' in 'my-website-bucket' that expires in 2 hours"
- "I need a temporary download link for 'data/export.csv' in 'my-data-bucket'"

**Response format:**
```json
{
  "url": "https://my-bucket.s3.amazonaws.com/report.pdf?X-Amz-Algorithm=AWS4-HMAC-SHA256&...",
  "expiresIn": 3600,
  "bucket": "my-docs-bucket",
  "key": "report.pdf"
}
```

**Parameters:**
- `bucket`: (required) The bucket name
- `key`: (required) The object key/path
- `expiresIn`: (optional) Expiration in seconds (default: 3600, max: 604800)

**Using the URL:**
- Copy the URL and paste it in your browser to download the file
- URLs expire after the specified time
- Anyone with the URL can download during the valid period

### 4. Generate Upload URL

**Tool:** `s3_presign_put` (requires `ALLOW_WRITE=true`)

**Example prompts for Claude:**
- "Give me an upload link for 'data/new-file.json' in 'my-data-bucket'"
- "Create a presigned PUT URL for uploading to 'uploads/image.png' in 'my-bucket'"
- "I need a 24-hour upload link for 'reports/monthly.csv' in 'my-reports-bucket' with content type 'text/csv'"

**Response format:**
```json
{
  "url": "https://my-bucket.s3.amazonaws.com/data/new-file.json?X-Amz-Algorithm=...",
  "expiresIn": 3600,
  "bucket": "my-data-bucket",
  "key": "data/new-file.json",
  "contentType": "application/json"
}
```

**Parameters:**
- `bucket`: (required) The bucket name
- `key`: (required) The object key/path where file will be uploaded
- `expiresIn`: (optional) Expiration in seconds (default: 3600, max: 604800)
- `contentType`: (optional) MIME type (e.g., "image/png", "text/csv")

**Using the upload URL:**

**PowerShell:**
```powershell
$url = "PRESIGNED_URL_HERE"
Invoke-WebRequest -Uri $url -Method PUT -InFile "C:\path\to\file.json" -ContentType "application/json"
```

**cURL:**
```bash
curl -X PUT -T ./file.json -H "Content-Type: application/json" "PRESIGNED_URL_HERE"
```

**Python:**
```python
import requests

with open('file.json', 'rb') as f:
    response = requests.put(url, data=f, headers={'Content-Type': 'application/json'})
    print(f"Status: {response.status_code}")
```

## Common Use Cases

### 1. Finding and Downloading Files

**Prompt:** "I need to find all PDF files in my-docs-bucket and get a download link for the most recent one"

Claude will:
1. List objects in the bucket with optional prefix filtering
2. Identify the most recent PDF based on `lastModified`
3. Generate a presigned download URL

### 2. Organizing Files by Prefix

**Prompt:** "Show me all files in my-photos-bucket organized by year (2023/, 2024/, etc.)"

Claude will:
1. List objects in the bucket
2. Group them by prefix pattern
3. Present organized results

### 3. Bulk Operations

**Prompt:** "List all files larger than 1MB in my-data-bucket and create download links for them"

Claude will:
1. List all objects
2. Filter by size
3. Generate presigned URLs for each

### 4. Uploading Files

**Prompt:** "I need to upload a CSV file to reports/2024/sales.csv in my-reports-bucket"

Claude will:
1. Generate a presigned PUT URL
2. Provide the URL and upload instructions
3. Include appropriate curl/PowerShell commands

### 5. Monitoring and Reporting

**Prompt:** "Give me a summary of my S3 storage: how many buckets, how many files in each, and total size"

Claude will:
1. List all buckets
2. Count objects in each bucket
3. Calculate total storage

## Tips & Best Practices

### Security

- **Never share presigned URLs publicly** - they grant temporary access to your files
- **Use shortest expiration time needed** - default is 1 hour, max is 7 days
- **Keep ALLOW_WRITE disabled** unless you specifically need upload functionality
- **Use IAM roles** with minimal permissions for the AWS credentials
- **Store credentials in .env** file, not in Claude Desktop config

### Performance

- **Use prefix filtering** when listing large buckets to reduce response time
- **Set maxKeys appropriately** - default lists all objects, which can be slow for large buckets
- **Consider bucket organization** - use prefixes like folders for better organization

### Debugging

If Claude can't access S3:
1. Check Claude Desktop logs (Help → Show Logs)
2. Verify AWS credentials are correct
3. Ensure the server built successfully (`npm run build`)
4. Test AWS credentials with AWS CLI
5. Check IAM permissions for your AWS user

### Content Types for Upload

Common MIME types for `contentType` parameter:

- **Images:** `image/png`, `image/jpeg`, `image/gif`, `image/webp`
- **Documents:** `application/pdf`, `application/msword`, `application/vnd.openxmlformats-officedocument.wordprocessingml.document`
- **Data:** `application/json`, `text/csv`, `application/xml`
- **Text:** `text/plain`, `text/html`, `text/css`
- **Archives:** `application/zip`, `application/gzip`
- **Default:** `application/octet-stream` (binary)

### Example Conversation Flow

```
You: "Show me my S3 buckets"
Claude: [Lists all buckets]

You: "What's in my-photos-bucket?"
Claude: [Lists objects in that bucket]

You: "Give me a download link for vacation-2024.jpg that lasts 2 hours"
Claude: [Generates presigned URL with 7200 second expiration]

You: "Now show me all the files in the 2023/ folder"
Claude: [Lists objects with prefix "2023/"]
```

## Next Steps

- Read [SETUP_GUIDE.md](SETUP_GUIDE.md) for installation instructions
- Check [README.md](README.md) for technical details
- See `examples/` directory for programmatic usage
