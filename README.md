# AWS S3 MCP Server

A Model Context Protocol (MCP) server that exposes AWS S3 operations through a secure, well-defined interface. This server provides tools for listing buckets and objects, and generating presigned URLs for safe data access.

Perfect for integrating S3 with Claude Desktop and other MCP clients!

## Features

- **List Buckets**: Enumerate all S3 buckets in your AWS account
- **List Objects**: Browse objects within a bucket with optional prefix filtering
- **Presigned GET URLs**: Generate secure, temporary URLs for downloading objects
- **Presigned PUT URLs**: Generate secure, temporary URLs for uploading objects (optional, requires ALLOW_WRITE flag)
- **Input Validation**: All inputs are validated using Zod schemas
- **Logging**: Structured logging with Pino
- **Safe by Default**: Write operations are disabled unless explicitly enabled
- **Cross-Platform**: Works on Windows, Mac, and Linux

## 🚀 Quick Start

### Fastest Way (Windows)

```powershell
# Run the automated setup
.\scripts\setup.ps1

# Add your AWS credentials
notepad .env

# Test the connection
.\scripts\test-connection.ps1

# Configure Claude Desktop
.\scripts\configure-claude.ps1
```

**Then restart Claude Desktop and ask:** "List my S3 buckets"

### Manual Setup (Any Platform)

```bash
# 1. Install and build
npm install
npm run build

# 2. Configure credentials
cp .env.example .env
# Edit .env with your AWS credentials

# 3. Test connection
node examples/quick-test.js

# 4. Add to Claude Desktop config
# Windows: %APPDATA%\Claude\claude_desktop_config.json
# Mac: ~/Library/Application Support/Claude/claude_desktop_config.json
```

Config to add:
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

**📖 Complete guide:** [QUICKSTART.md](QUICKSTART.md) (5 minutes)

## Documentation

- **[Setup Guide](SETUP_GUIDE.md)** - Complete installation and configuration instructions
- **[Usage Guide](USAGE_GUIDE.md)** - How to use with Claude Desktop and examples
- **[Examples](examples/)** - Sample scripts for download/upload operations

## Installation

```bash
npm install
npm run build
```

## Configuration

Create a `.env` file in the root directory (see `.env.example`):

```bash
# Required
AWS_ACCESS_KEY_ID=your_access_key_here
AWS_SECRET_ACCESS_KEY=your_secret_key_here
AWS_REGION=us-east-1

# Optional: Enable write operations (presign_put)
ALLOW_WRITE=false

# Optional: Set log level (default: info)
LOG_LEVEL=info
```

**📖 For detailed setup instructions, see [SETUP_GUIDE.md](SETUP_GUIDE.md)**

## Usage

The server uses stdio transport and communicates via standard input/output, making it suitable for integration with MCP clients like Claude Desktop.

### Running Standalone

```bash
npm start
```

### Common Operations

**List all buckets:**
```
"Show me all my S3 buckets"
```

**List objects in a bucket:**
```
"List all files in my-data-bucket"
```

**Get download link:**
```
"Give me a download link for report.pdf in my-docs-bucket"
```

**Get upload link (if ALLOW_WRITE=true):**
```
"Generate an upload URL for new-file.json in my-bucket"
```

**📖 For complete usage examples, see [USAGE_GUIDE.md](USAGE_GUIDE.md)**

### Available Tools

#### 1. `s3_list_buckets`

List all S3 buckets in the AWS account.

**Input**: None

**Example Response**:
```json
[
  {
    "name": "my-bucket",
    "creationDate": "2024-01-01T00:00:00.000Z"
  }
]
```

#### 2. `s3_list_objects`

List objects in an S3 bucket with optional filtering.

**Input**:
- `bucket` (required): The name of the S3 bucket
- `prefix` (optional): Filter objects by prefix
- `maxKeys` (optional): Maximum number of objects to return (1-1000)

**Example Response**:
```json
{
  "objects": [
    {
      "key": "path/to/file.txt",
      "size": 1024,
      "lastModified": "2024-01-01T00:00:00.000Z",
      "etag": "\"abc123\""
    }
  ],
  "isTruncated": false,
  "keyCount": 1
}
```

#### 3. `s3_presign_get`

Generate a presigned URL for downloading an object.

**Input**:
- `bucket` (required): The name of the S3 bucket
- `key` (required): The object key
- `expiresIn` (optional): URL expiration time in seconds (default: 3600, max: 604800)

**Example Response**:
```json
{
  "url": "https://bucket.s3.amazonaws.com/key?X-Amz-Algorithm=...",
  "expiresIn": 3600,
  "bucket": "my-bucket",
  "key": "path/to/file.txt"
}
```

#### 4. `s3_presign_put`

Generate a presigned URL for uploading an object (requires `ALLOW_WRITE=true`).

**Input**:
- `bucket` (required): The name of the S3 bucket
- `key` (required): The object key
- `expiresIn` (optional): URL expiration time in seconds (default: 3600, max: 604800)
- `contentType` (optional): Content type of the object

**Example Response**:
```json
{
  "url": "https://bucket.s3.amazonaws.com/key?X-Amz-Algorithm=...",
  "expiresIn": 3600,
  "bucket": "my-bucket",
  "key": "path/to/file.txt",
  "contentType": "application/json"
}
```

## Development

### Build

```bash
npm run build
```

### Watch Mode

```bash
npm run dev
```

### Run Tests

```bash
npm test
```

### Lint

```bash
npm run lint
```

### Quick Connection Test

```bash
node examples/quick-test.js
```

## Troubleshooting

### Server Not Responding in Claude

1. Check Claude Desktop logs: Help → Show Logs
2. Verify the server path in config is correct (use absolute path)
3. Test manually: `node dist/index.js`
4. Restart Claude Desktop

### AWS Connection Issues

**Error: Missing credentials**
- Verify `.env` file exists in project root
- Check no extra spaces in environment variables
- Ensure file is named exactly `.env` (not `.env.txt`)

**Error: Access Denied**
- Verify IAM user has S3 permissions
- Check the bucket exists in the specified region
- Test credentials: `node examples/quick-test.js`

**Error: Invalid Access Key**
- Verify AWS_ACCESS_KEY_ID is correct
- Check AWS_SECRET_ACCESS_KEY matches
- Ensure credentials haven't been rotated/deleted

### Write Operations Not Working

- Set `ALLOW_WRITE=true` in `.env` file
- Restart the MCP server
- Verify IAM user has PutObject permission

### Performance Issues

For buckets with millions of objects:
- Use prefix filtering: `"List files in my-bucket with prefix 'logs/2024/'"`
- Limit results: `"Show first 100 files in my-bucket"`
- Organize files with prefixes (like folders)

**📖 For more troubleshooting, see [SETUP_GUIDE.md](SETUP_GUIDE.md#troubleshooting)**

## Security Best Practices

✅ **DO:**
- Store credentials in `.env` file (never commit to git)
- Use IAM users with minimal required permissions
- Disable ALLOW_WRITE unless needed
- Use short expiration times for presigned URLs
- Rotate access keys regularly

❌ **DON'T:**
- Share presigned URLs publicly
- Use root AWS account credentials
- Commit `.env` file to version control
- Grant broader permissions than necessary

## Project Structure

```
aws-s3-mcp-server/
├── dist/                 # Compiled JavaScript (generated)
├── src/                  # TypeScript source code
│   ├── index.ts         # Main MCP server
│   └── index.test.ts    # Unit tests
├── examples/            # Example scripts and usage
│   ├── quick-test.js    # AWS connection test
│   ├── test-upload.ps1  # Upload example
│   └── test-download.ps1 # Download example
├── .env.example         # Environment template
├── package.json         # Dependencies
├── tsconfig.json        # TypeScript config
├── README.md           # This file
├── SETUP_GUIDE.md      # Installation guide
└── USAGE_GUIDE.md      # Usage examples
```

## Security

- AWS credentials are loaded from environment variables only
- Write operations (presigned PUT URLs) are disabled by default
- All inputs are validated using Zod schemas
- Presigned URLs have configurable expiration (max 7 days)
- Logs are written to stderr to avoid interfering with stdio transport

## Support

- **Issues:** Report bugs or request features on GitHub
- **Setup Help:** See [SETUP_GUIDE.md](SETUP_GUIDE.md)
- **Usage Help:** See [USAGE_GUIDE.md](USAGE_GUIDE.md)
- **Examples:** Check the `examples/` directory

## Contributing

Contributions are welcome! Please:
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

MIT

---

## Quick Reference

| Task | Command |
|------|---------|
| Install | `npm install` |
| Build | `npm run build` |
| Test AWS | `node examples/quick-test.js` |
| Start Server | `npm start` |
| Run Tests | `npm test` |
| Development Mode | `npm run dev` |

**Need Help?** Start with [SETUP_GUIDE.md](SETUP_GUIDE.md) for installation or [USAGE_GUIDE.md](USAGE_GUIDE.md) for examples!