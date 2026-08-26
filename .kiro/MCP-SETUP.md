# MCP Server Setup — TaskFlow

Configure these MCP servers via Kiro's command palette: "MCP: Open MCP Configuration"

## Docker MCP

```json
{
  "docker": {
    "command": "uvx",
    "args": ["mcp-docker"],
    "env": {},
    "disabled": false
  }
}
```

## PostgreSQL MCP

```json
{
  "postgres": {
    "command": "uvx",
    "args": ["mcp-postgres"],
    "env": {
      "DATABASE_URL": "postgresql://taskflow:taskflow@localhost:5432/taskflow"
    },
    "disabled": false
  }
}
```

## Postman MCP

```json
{
  "postman": {
    "command": "uvx",
    "args": ["mcp-postman"],
    "env": {
      "POSTMAN_API_KEY": "<your-postman-api-key>"
    },
    "disabled": false
  }
}
```

## Setup Steps

1. Open Command Palette → "MCP: Open MCP Configuration"
2. Add the server configs above to the workspace-level configuration
3. Ensure `uvx` is installed (`pip install uv` or `brew install uv`)
4. Restart MCP servers after configuration changes
