# Quick Start Guide - AWS S3 MCP Server

Get up and running with the AWS S3 MCP Server in 5 minutes!

## Prerequisites

- **Node.js** v18+ ([Download](https://nodejs.org/))
- **AWS Account** with S3 access
- **AWS Credentials** (Access Key ID & Secret Key)

## 5-Minute Setup (Windows)

### Step 1: Setup the Project

```powershell
# Navigate to the project directory
cd C:\src\aws-s3-mcp-server

# Run the setup script
.\scripts\setup.ps1
```

This installs dependencies and builds the project.

### Step 2: Configure AWS Credentials

Edit the `.env` file that was created:

```powershell
notepad .env
```

Add your AWS credentials:

```bash
AWS_ACCESS_KEY_ID=AKIAIOSFODNN7EXAMPLE
AWS_SECRET_ACCESS_KEY=wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY
AWS_REGION=us-east-1
ALLOW_WRITE=false
```

**Don't have AWS credentials?** See [Getting AWS Credentials](#getting-aws-credentials) below.

### Step 3: Test the Connection

```powershell
.\scripts\test-connection.ps1
```

You should see your S3 buckets listed. If you get an error, see [Troubleshooting](#troubleshooting) below.

### Step 4: Configure Your MCP Client

#### For Claude Desktop

Edit the configuration file:
- **Windows:** `%APPDATA%\Claude\claude_desktop_config.json`
- **Mac:** `~/Library/Application Support/Claude/claude_desktop_config.json`
- **Linux:** `~/.config/Claude/claude_desktop_config.json`

Add this configuration:

```json
{
  "mcpServers": {
    "aws-s3": {
      "command": "node",
      "args": ["C:\\src\\aws-s3-mcp-server\\dist\\index.js"]
    }
  }
}
```

**Replace `C:\\src\\aws-s3-mcp-server\\dist\\index.js` with your actual installation path.**
- Windows: Use double backslashes `\\`
- Mac/Linux: Use forward slashes `/`

#### For VS Code (Copilot Chat)

Edit `~/.vscode/mcp.json`:

```json
{
  "servers": {
    "aws-s3": {
      "type": "stdio",
      "command": "node",
      "args": ["C:\\src\\aws-s3-mcp-server\\dist\\index.js"]
    }
  }
}
```

**Then reload VS Code:** Press `Ctrl+Shift+P` → Type "Reload Window" → Press Enter

### Step 5: Test It

**For Claude Desktop:**
1. Restart Claude Desktop
2. Ask: `"List my S3 buckets"`

**For VS Code:**
1. In Copilot Chat, type: `@aws-s3 list my buckets`

**🎉 Done!** You're now using S3 with your MCP client!

---

## Manual Setup (Any Platform)

If you're not on Windows or prefer manual setup:

### 1. Install & Build

```bash
npm install
npm run build
```

### 2. Configure Environment

```bash
# Copy the template
cp .env.example .env

# Edit with your credentials
# Linux/Mac: nano .env
# Windows: notepad .env
```

Add:
```bash
AWS_ACCESS_KEY_ID=your_key_here
AWS_SECRET_ACCESS_KEY=your_secret_here
AWS_REGION=us-east-1
```

### 3. Test Connection

```bash
node examples/quick-test.js
```

### 4. Configure Claude Desktop

**Windows:** `%APPDATA%\Claude\claude_desktop_config.json`
**Mac:** `~/Library/Application Support/Claude/claude_desktop_config.json`
**Linux:** `~/.config/Claude/claude_desktop_config.json`

Add this configuration:

```json
{
  "mcpServers": {
    "aws-s3": {
      "command": "node",
      "args": [
        "/absolute/path/to/aws-s3-mcp-server/dist/index.js"
      ]
    }
  }
}
```

**Replace the path with your actual installation:**
- **Windows:** `"C:\\Users\\YourName\\projects\\aws-s3-mcp-server\\dist\\index.js"`
- **Mac/Linux:** `"/home/username/projects/aws-s3-mcp-server/dist/index.js"`

**Note:** Windows paths require double backslashes (`\\`)

### 4b. Configure VS Code (Alternative)

If you're using VS Code with Copilot Chat, edit `~/.vscode/mcp.json`:

```json
{
  "servers": {
    "aws-s3": {
      "type": "stdio",
      "command": "node",
      "args": [
        "/absolute/path/to/aws-s3-mcp-server/dist/index.js"
      ]
    }
  }
}
```

Then reload VS Code and use: `@aws-s3 list my buckets`

### 5. Restart Claude & Test

Restart Claude Desktop, then ask: `"Show me my S3 buckets"`

---

## Getting AWS Credentials

### Method 1: IAM User (Recommended)

1. **Log into AWS Console:** https://console.aws.amazon.com/
2. **Go to IAM:** Search for "IAM" → Users → Create user
3. **Create user:** Name it `mcp-s3-server`
4. **Attach policy:** Select `AmazonS3ReadOnlyAccess` or `AmazonS3FullAccess`
5. **Create access key:**
   - Security credentials tab → Create access key
   - Select "Application running outside AWS"
   - Download the CSV file with your credentials

### Method 2: Use Existing Credentials

If you already use AWS CLI:

```bash
# View your credentials
cat ~/.aws/credentials

# Copy the access key and secret key to .env
```

---

## What Can You Do?

### List Buckets
```
Claude: "What S3 buckets do I have?"
```

### Browse Files
```
Claude: "Show me files in my-bucket"
Claude: "List all PDFs in my-docs-bucket"
Claude: "Show files in my-photos-bucket in the 2024/ folder"
```

### Download Files
```
Claude: "Give me a download link for report.pdf in my-bucket"
Claude: "Create a 2-hour download link for data/export.csv"
```

### Upload Files (if ALLOW_WRITE=true)
```
Claude: "Generate an upload URL for new-file.json in my-bucket"
Claude: "I need to upload a PDF to reports/2024/monthly.pdf"
```

Then use the provided URL with PowerShell/curl/browser.

---

## Troubleshooting

### ❌ "AWS credentials not found"

**Solution:**
1. Check `.env` file exists in project root
2. Verify no extra spaces around `=` signs
3. Ensure values don't have quotes unless they're in your actual key

### ❌ "Access Denied"

**Solution:**
1. Verify IAM user has S3 permissions
2. Check bucket exists in the specified region
3. Ensure credentials are correct

### ❌ "Invalid Access Key"

**Solution:**
1. Double-check Access Key ID in `.env`
2. Verify Secret Access Key matches
3. Create new access keys if needed

### ❌ Server not showing in Claude

**Solution:**
1. Check path in `claude_desktop_config.json` is absolute
2. Windows: Use double backslashes (`C:\\...`)
3. Verify `dist/index.js` exists (run `npm run build`)
4. Check Claude Desktop logs: Help → Show Logs
5. Restart Claude Desktop

### ❌ "Module not found" errors

**Solution:**
```powershell
# Clean and reinstall
Remove-Item -Recurse -Force node_modules
npm install
npm run build
```

---

## Advanced Configuration

### Enable Write Operations

To allow upload URLs, edit `.env`:

```bash
ALLOW_WRITE=true
```

Then restart the server.

### Change Log Level

For debugging, increase log verbosity:

```bash
LOG_LEVEL=debug
```

Options: `trace`, `debug`, `info`, `warn`, `error`, `fatal`

### Use Specific AWS Profile

If you use multiple AWS profiles:

```bash
# Instead of Access Key in .env, use AWS profile
AWS_PROFILE=myprofile
```

---

## Next Steps

✅ **You're all set!** Here's what to explore next:

1. **[USAGE_GUIDE.md](USAGE_GUIDE.md)** - Detailed examples and use cases
2. **[SETUP_GUIDE.md](SETUP_GUIDE.md)** - Advanced configuration and security
3. **[examples/](examples/)** - Scripts for upload/download operations
4. **[scripts/](scripts/)** - Windows automation scripts

---

## Quick Reference

| Command | Purpose |
|---------|---------|
| `.\scripts\setup.ps1` | Initial setup (Windows) |
| `.\scripts\test-connection.ps1` | Test AWS connection |
| `npm run build` | Rebuild after changes |
| `node examples/quick-test.js` | Manual connection test |

---

## Security Reminders

- ✅ Keep `.env` file private (never commit to git)
- ✅ Use IAM users with minimal permissions
- ✅ Rotate access keys regularly
- ✅ Keep `ALLOW_WRITE=false` unless needed
- ❌ Never share presigned URLs publicly
- ❌ Don't use root AWS account credentials

---

## Getting Help

- **Setup issues:** See [SETUP_GUIDE.md](SETUP_GUIDE.md#troubleshooting)
- **Usage questions:** See [USAGE_GUIDE.md](USAGE_GUIDE.md)
- **Examples:** Check `examples/` directory
- **Scripts:** See `scripts/README.md`

**Happy coding! 🚀**
