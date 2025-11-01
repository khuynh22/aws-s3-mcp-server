# AWS S3 MCP Server - Setup Guide

Complete installation and configuration guide for the AWS S3 MCP Server.

## Table of Contents
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [AWS Setup](#aws-setup)
- [Configuration](#configuration)
- [Building the Project](#building-the-project)
- [Testing the Installation](#testing-the-installation)
- [Integrating with MCP Clients](#integrating-with-mcp-clients)
- [Troubleshooting](#troubleshooting)

## Prerequisites

Before installing the AWS S3 MCP Server, ensure you have:

### Required Software

1. **Node.js** (v18 or higher)
   - Download from: https://nodejs.org/
   - Verify installation: `node --version`
   - Should show v18.0.0 or higher

2. **npm** (comes with Node.js)
   - Verify installation: `npm --version`
   - Should show 8.0.0 or higher

3. **Git** (optional, for cloning)
   - Download from: https://git-scm.com/
   - Verify installation: `git --version`

### Required AWS Resources

1. **AWS Account**
   - Sign up at: https://aws.amazon.com/

2. **AWS IAM User with S3 Access**
   - Access Key ID
   - Secret Access Key
   - Appropriate S3 permissions (see [AWS Setup](#aws-setup))

## Installation

### Method 1: From Git Repository (Recommended)

```powershell
# Clone the repository
git clone https://github.com/yourusername/aws-s3-mcp-server.git
cd aws-s3-mcp-server

# Install dependencies
npm install

# Build the project
npm run build
```

### Method 2: From Downloaded ZIP

```powershell
# Extract the ZIP file to your desired location
# Open PowerShell in the extracted folder

# Install dependencies
npm install

# Build the project
npm run build
```

### Verify Installation

After installation, verify these files/folders exist:

```
aws-s3-mcp-server/
├── dist/                 # Compiled JavaScript (created after build)
│   ├── index.js
│   └── index.test.js
├── src/                  # TypeScript source code
├── node_modules/         # Dependencies
├── package.json
├── tsconfig.json
├── .env.example
└── README.md
```

## AWS Setup

### Creating an IAM User for S3 Access

1. **Log in to AWS Console**
   - Go to: https://console.aws.amazon.com/

2. **Navigate to IAM**
   - Search for "IAM" in the AWS Console
   - Click "Users" → "Create user"

3. **Create User**
   - User name: `mcp-s3-server` (or any name you prefer)
   - Select: "Provide user access to AWS Management Console" → No
   - Click "Next"

4. **Attach Permissions**

   **Option A: Full S3 Access (Easier)**
   - Select "Attach policies directly"
   - Search for and select: `AmazonS3FullAccess`
   - Click "Next" → "Create user"

   **Option B: Limited Access (More Secure)**
   - Select "Attach policies directly"
   - Click "Create policy" → JSON tab
   - Paste this policy (replace `YOUR-BUCKET-NAME`):

   ```json
   {
     "Version": "2012-10-17",
     "Statement": [
       {
         "Effect": "Allow",
         "Action": [
           "s3:ListAllMyBuckets",
           "s3:GetBucketLocation"
         ],
         "Resource": "*"
       },
       {
         "Effect": "Allow",
         "Action": [
           "s3:ListBucket",
           "s3:GetObject",
           "s3:GetObjectVersion"
         ],
         "Resource": [
           "arn:aws:s3:::YOUR-BUCKET-NAME",
           "arn:aws:s3:::YOUR-BUCKET-NAME/*"
         ]
       },
       {
         "Effect": "Allow",
         "Action": [
           "s3:PutObject",
           "s3:PutObjectAcl"
         ],
         "Resource": [
           "arn:aws:s3:::YOUR-BUCKET-NAME/*"
         ]
       }
     ]
   }
   ```

   - Click "Next: Tags" → "Next: Review"
   - Name: `mcp-s3-limited-access`
   - Click "Create policy"

5. **Create Access Keys**
   - Click on the newly created user
   - Go to "Security credentials" tab
   - Click "Create access key"
   - Select "Application running outside AWS"
   - Click "Next" → "Create access key"
   - **Important:** Save both:
     - Access Key ID (e.g., `AKIAIOSFODNN7EXAMPLE`)
     - Secret Access Key (e.g., `wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY`)
   - Download the .csv file for backup

### Choosing an AWS Region

Select a region close to you for better performance:

- **US East (N. Virginia)**: `us-east-1`
- **US West (Oregon)**: `us-west-2`
- **EU (Ireland)**: `eu-west-1`
- **EU (Frankfurt)**: `eu-central-1`
- **Asia Pacific (Tokyo)**: `ap-northeast-1`
- **Asia Pacific (Singapore)**: `ap-southeast-1`

Full list: https://docs.aws.amazon.com/general/latest/gr/rande.html

## Configuration

### Setting Up Environment Variables

1. **Copy the example file:**

   ```powershell
   Copy-Item .env.example .env
   ```

2. **Edit the `.env` file:**

   Open `.env` in your text editor and update:

   ```bash
   # AWS Credentials (REQUIRED)
   AWS_ACCESS_KEY_ID=AKIAIOSFODNN7EXAMPLE
   AWS_SECRET_ACCESS_KEY=wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY
   AWS_REGION=us-east-1

   # Optional: Enable write operations (presign_put)
   # Uncomment the line below to allow upload URL generation
   # ALLOW_WRITE=true

   # Optional: Set log level (default: info)
   # Options: trace, debug, info, warn, error, fatal
   # LOG_LEVEL=info
   ```

3. **Save the file**

### Configuration Options Explained

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `AWS_ACCESS_KEY_ID` | Yes | - | Your AWS access key ID |
| `AWS_SECRET_ACCESS_KEY` | Yes | - | Your AWS secret access key |
| `AWS_REGION` | Yes | - | AWS region (e.g., us-east-1) |
| `ALLOW_WRITE` | No | `false` | Enable presigned PUT URLs for uploads |
| `LOG_LEVEL` | No | `info` | Logging verbosity (trace/debug/info/warn/error/fatal) |

### Security Best Practices

✅ **DO:**
- Store credentials in `.env` file (ignored by git)
- Use IAM users with minimal required permissions
- Rotate access keys regularly
- Use different credentials for development and production
- Enable MFA on your AWS account

❌ **DON'T:**
- Commit `.env` file to version control
- Share your access keys
- Use root account credentials
- Store credentials in Claude Desktop config (use .env instead)
- Give broader permissions than needed

## Building the Project

### Standard Build

```powershell
npm run build
```

This compiles TypeScript (`src/`) to JavaScript (`dist/`).

### Development Mode (Auto-rebuild on changes)

```powershell
npm run dev
```

Watches for changes and rebuilds automatically.

### Running Tests

```powershell
npm test
```

Runs validation tests for input schemas.

## Testing the Installation

### 1. Verify Build Output

Check that `dist/` folder contains:
- `index.js`
- `index.d.ts`
- `index.js.map`

### 2. Test the Server Manually

```powershell
# Run the server
npm start
```

The server should start and wait for input on stdin. You won't see much output - this is normal!

**To stop:** Press `Ctrl+C`

### 3. Verify AWS Connection

Create a test script `test-connection.ps1`:

```powershell
# test-connection.ps1
$env:AWS_ACCESS_KEY_ID = "YOUR_ACCESS_KEY"
$env:AWS_SECRET_ACCESS_KEY = "YOUR_SECRET_KEY"
$env:AWS_REGION = "us-east-1"

node -e "
const { S3Client, ListBucketsCommand } = require('@aws-sdk/client-s3');
const client = new S3Client({ region: process.env.AWS_REGION });
client.send(new ListBucketsCommand({}))
  .then(data => console.log('✓ AWS Connection successful!'))
  .catch(err => console.error('✗ AWS Connection failed:', err.message));
"
```

Run it:
```powershell
.\test-connection.ps1
```

Expected output: `✓ AWS Connection successful!`

## Integrating with MCP Clients

### Claude Desktop

1. **Locate the config file:**

   ```powershell
   # Windows
   notepad "$env:APPDATA\Claude\claude_desktop_config.json"

   # Mac
   open ~/Library/Application\ Support/Claude/claude_desktop_config.json

   # Linux
   nano ~/.config/Claude/claude_desktop_config.json
   ```

2. **Add server configuration:**

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

   **Replace `/absolute/path/to/` with your actual installation path:**

   - **Windows:** `"C:\\Users\\YourName\\projects\\aws-s3-mcp-server\\dist\\index.js"`
   - **Mac/Linux:** `"/home/username/projects/aws-s3-mcp-server/dist/index.js"`

   **Important:**
   - Use the **absolute path** to your installation
   - Windows: Use double backslashes (`\\`) in paths
   - The server automatically reads credentials from `.env` file

3. **Restart Claude Desktop**

4. **Test in Claude:**
   - Type: "List my S3 buckets"
   - Claude should use the MCP server to fetch and display your buckets

### VS Code (with Copilot Chat)

1. **Locate your MCP config file:**

   - **Windows:** `%USERPROFILE%\.vscode\mcp.json`
   - **Mac:** `~/.vscode/mcp.json`
   - **Linux:** `~/.vscode/mcp.json`

2. **Add to the `servers` section:**

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

   **Replace `/absolute/path/to/` with your actual installation path:**

   - **Windows:** `"C:\\Users\\YourName\\projects\\aws-s3-mcp-server\\dist\\index.js"`
   - **Mac/Linux:** `"/home/username/projects/aws-s3-mcp-server/dist/index.js"`

3. **Reload VS Code:**
   - Press `Ctrl+Shift+P` (or `Cmd+Shift+P` on Mac)
   - Type "Developer: Reload Window"
   - Press Enter

4. **Test in Copilot Chat:**
   ```
   @aws-s3 list my buckets
   ```

### Other MCP Clients

For other MCP clients, configure them to run:

```bash
node /absolute/path/to/aws-s3-mcp-server/dist/index.js
```

The server uses stdio transport and communicates via stdin/stdout.

## Troubleshooting

### Build Errors

**Error:** `Cannot find module '@modelcontextprotocol/sdk'`

**Solution:**
```powershell
rm -r node_modules
npm install
npm run build
```

---

**Error:** `tsc: command not found`

**Solution:**
```powershell
npm install -g typescript
npm run build
```

### AWS Connection Errors

**Error:** `Missing credentials in config`

**Solution:**
- Verify `.env` file exists and contains credentials
- Ensure no extra spaces or quotes around values
- Check file is in the project root directory

---

**Error:** `The security token included in the request is invalid`

**Solution:**
- Verify access key ID and secret key are correct
- Check the IAM user hasn't been deleted
- Ensure credentials haven't expired

---

**Error:** `Access Denied`

**Solution:**
- Verify IAM user has S3 permissions
- Check the bucket policy doesn't deny access
- Ensure correct region is configured

### Runtime Errors

**Error:** `ALLOW_WRITE is required for this operation`

**Solution:**
- Add `ALLOW_WRITE=true` to `.env` file
- Restart the server

---

**Error:** `Bucket does not exist`

**Solution:**
- Verify bucket name is correct (case-sensitive)
- Check you're in the correct AWS region
- Ensure bucket exists in your account

### Claude Desktop Integration Issues

**Server not showing up in Claude:**

1. Check Claude Desktop logs:
   - Help → Show Logs
   - Look for errors mentioning "aws-s3"

2. Verify config file syntax:
   - Must be valid JSON
   - Check for missing commas, brackets

3. Test server manually:
   ```powershell
   node C:\src\aws-s3-mcp-server\dist\index.js
   ```

4. Ensure absolute paths in config

**Claude can't list buckets:**

1. Check server logs (stderr)
2. Verify AWS credentials
3. Test AWS connection manually (see above)
4. Restart Claude Desktop

## Performance Optimization

### For Large Buckets

When working with buckets containing millions of objects:

1. **Use prefix filtering:**
   ```
   "Show files in my-bucket with prefix 'logs/2024/'"
   ```

2. **Limit results:**
   ```
   "List first 100 objects in my-bucket"
   ```

3. **Organize with prefixes:**
   - Structure: `bucket/year/month/day/file`
   - Enables efficient filtering

### Logging

Reduce log verbosity for production:

```bash
# In .env
LOG_LEVEL=warn
```

## Next Steps

- Read [USAGE_GUIDE.md](USAGE_GUIDE.md) for usage examples
- Check [README.md](README.md) for API reference
- See `examples/` for code samples

## Getting Help

If you encounter issues:

1. Check this guide's troubleshooting section
2. Review Claude Desktop logs
3. Test AWS credentials with AWS CLI
4. Verify IAM permissions
5. Check GitHub issues: [project repository]

## Security Checklist

Before using in production:

- [ ] Created dedicated IAM user (not root account)
- [ ] Applied least-privilege IAM policy
- [ ] Credentials stored in `.env` file only
- [ ] `.env` file in `.gitignore`
- [ ] Access keys rotated regularly
- [ ] MFA enabled on AWS account
- [ ] `ALLOW_WRITE` disabled unless needed
- [ ] Appropriate presigned URL expiration times
- [ ] Server logs not exposing sensitive data
