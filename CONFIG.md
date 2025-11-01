# MCP Client Configuration

Simple copy-paste configuration for different MCP clients.

## Claude Desktop

**Config file location:**
- **Windows:** `%APPDATA%\Claude\claude_desktop_config.json`
- **Mac:** `~/Library/Application Support/Claude/claude_desktop_config.json`
- **Linux:** `~/.config/Claude/claude_desktop_config.json`

**Configuration:**

```json
{
  "mcpServers": {
    "aws-s3": {
      "command": "node",
      "args": [
        "C:\\path\\to\\aws-s3-mcp-server\\dist\\index.js"
      ]
    }
  }
}
```

**Important:**
- Replace `C:\\path\\to\\aws-s3-mcp-server\\dist\\index.js` with your actual path
- Windows: Use double backslashes `\\`
- Mac/Linux: Use forward slashes `/`
- Restart Claude Desktop after editing

---

## VS Code (Copilot Chat)

**Config file location:**
- `~/.vscode/mcp.json` (all platforms)

**Configuration:**

```json
{
  "servers": {
    "aws-s3": {
      "type": "stdio",
      "command": "node",
      "args": [
        "C:\\path\\to\\aws-s3-mcp-server\\dist\\index.js"
      ]
    }
  }
}
```

**Important:**
- Replace with your actual installation path
- After editing, reload VS Code: `Ctrl+Shift+P` → "Developer: Reload Window"
- Use in Copilot Chat: `@aws-s3 list my buckets`

---

## Testing

**Claude Desktop:**
```
Ask Claude: "List my S3 buckets"
```

**VS Code:**
```
In Copilot Chat: @aws-s3 list my buckets
```

---

## Troubleshooting

**Server not working?**

1. Verify the path in your config is correct and absolute
2. Check `dist/index.js` exists (run `npm run build` if missing)
3. Ensure `.env` file has valid AWS credentials
4. Restart your MCP client after config changes
5. Check client logs:
   - Claude Desktop: Help → Show Logs
   - VS Code: Output panel → MCP logs

**Need help?** See [SETUP_GUIDE.md](SETUP_GUIDE.md) for detailed troubleshooting.
