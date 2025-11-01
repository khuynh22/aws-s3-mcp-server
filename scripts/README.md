# Windows Scripts for AWS S3 MCP Server

This directory contains PowerShell scripts to simplify server management on Windows.

## Available Scripts

### setup.ps1

**Purpose:** Complete initial setup of the MCP server

**Usage:**
```powershell
.\scripts\setup.ps1
```

**What it does:**
1. Checks Node.js and npm installation
2. Installs dependencies (`npm install`)
3. Builds the project (`npm run build`)
4. Creates `.env` file from template if needed
5. Shows next steps

**When to use:**
- First time setup
- After cloning the repository
- After pulling major updates

---

### test-connection.ps1

**Purpose:** Test AWS credentials and S3 connection

**Usage:**
```powershell
.\scripts\test-connection.ps1
```

**What it does:**
1. Checks for `.env` file
2. Runs the quick connection test
3. Lists your S3 buckets
4. Verifies IAM permissions
5. Shows configuration status

**When to use:**
- After setting up AWS credentials
- When troubleshooting connection issues
- Before configuring Claude Desktop
- To verify IAM permissions

---

### configure-claude.ps1

**Purpose:** Generate and configure Claude Desktop config

**Usage:**
```powershell
.\scripts\configure-claude.ps1
```

**What it does:**
1. Checks if server is built
2. Generates JSON configuration for Claude Desktop
3. Shows the config file location
4. Optionally creates the config file
5. Provides next steps

**When to use:**
- After completing initial setup
- When setting up Claude Desktop integration
- If you need to update the server path

---

### start.ps1

**Purpose:** Start the MCP server

**Usage:**
```powershell
.\scripts\start.ps1
```

**What it does:**
1. Checks if server is built
2. Verifies `.env` file exists
3. Shows current configuration
4. Starts the MCP server

**When to use:**
- To manually test the server
- For debugging server issues
- When running server standalone (not through Claude)

**Note:** For normal use with Claude Desktop, you don't need to run this - Claude will start the server automatically.

---

## Quick Workflow

### First Time Setup

```powershell
# 1. Setup the project
.\scripts\setup.ps1

# 2. Edit .env file with your AWS credentials
notepad .env

# 3. Test AWS connection
.\scripts\test-connection.ps1

# 4. Configure Claude Desktop
.\scripts\configure-claude.ps1

# 5. Restart Claude Desktop and test
```

### After Updating Code

```powershell
# Rebuild the project
npm run build

# Test connection still works
.\scripts\test-connection.ps1
```

### Troubleshooting

```powershell
# Test if server runs manually
.\scripts\start.ps1

# Test AWS credentials
.\scripts\test-connection.ps1

# Regenerate Claude config
.\scripts\configure-claude.ps1
```

## Common Issues

### Script Execution Policy Error

**Error:** `cannot be loaded because running scripts is disabled`

**Solution:**
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

### Path Not Found

**Error:** `.\scripts\setup.ps1 : The term '.\scripts\setup.ps1' is not recognized`

**Solution:** Make sure you're in the project root directory:
```powershell
cd C:\path\to\aws-s3-mcp-server
.\scripts\setup.ps1
```

### Node.js Not Found

**Error:** `node : The term 'node' is not recognized`

**Solution:**
1. Install Node.js from https://nodejs.org/
2. Restart PowerShell
3. Verify: `node --version`

## Tips

- **Run from project root:** All scripts should be run from the `aws-s3-mcp-server` directory
- **Use tab completion:** Type `.\scripts\` and press Tab to see available scripts
- **Check output:** Scripts use colors to indicate success (green), warnings (yellow), and errors (red)
- **Read the docs:** For detailed info, see [SETUP_GUIDE.md](../SETUP_GUIDE.md)

## Manual Alternatives

If you prefer to run commands manually:

```powershell
# Instead of setup.ps1
npm install
npm run build
Copy-Item .env.example .env

# Instead of test-connection.ps1
node examples/quick-test.js

# Instead of start.ps1
npm start
```

## Next Steps

After running the setup scripts:
- Read [SETUP_GUIDE.md](../SETUP_GUIDE.md) for detailed configuration
- Check [USAGE_GUIDE.md](../USAGE_GUIDE.md) for usage examples
- Try the examples in `examples/` directory
