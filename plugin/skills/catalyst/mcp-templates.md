# Catalyst MCP Server Templates

Reference templates for generating project-specific MCP server configurations. Each template should be adapted to the actual codebase — replace all placeholders with real values detected from analysis.

---

## PostgreSQL MCP Server

For projects using PostgreSQL databases.

```json
{
  "mcpServers": {
    "postgres": {
      "type": "stdio",
      "command": "npx",
      "args": [
        "-y",
        "@modelcontextprotocol/server-postgres",
        "{POSTGRES_CONNECTION_STRING_ENV_REF}"
      ],
      "env": {}
    }
  }
}
```

**Detection triggers**: `pg`, `postgres`, `@prisma/client` with PostgreSQL provider, `TypeORM` with pg driver, `knex` with pg, `sequelize` with pg, `DATABASE_URL` containing `postgres`
**Setup**: `npm install -g @modelcontextprotocol/server-postgres` or use npx
**Safety**: Connection string should reference env var, not contain actual credentials. Default to development database only.

---

## SQLite MCP Server

For projects using SQLite databases.

```json
{
  "mcpServers": {
    "sqlite": {
      "type": "stdio",
      "command": "npx",
      "args": [
        "-y",
        "@modelcontextprotocol/server-sqlite",
        "{SQLITE_DB_PATH}"
      ]
    }
  }
}
```

**Detection triggers**: `better-sqlite3`, `sqlite3`, `@prisma/client` with SQLite provider, `*.db` or `*.sqlite` files, `drizzle` with SQLite
**Setup**: `npm install -g @modelcontextprotocol/server-sqlite` or use npx
**Safety**: Point to development database file only. Never point to production data.

---

## GitHub MCP Server

For projects with GitHub integration.

```json
{
  "mcpServers": {
    "github": {
      "type": "stdio",
      "command": "npx",
      "args": [
        "-y",
        "@modelcontextprotocol/server-github"
      ],
      "env": {
        "GITHUB_PERSONAL_ACCESS_TOKEN": "{GITHUB_TOKEN_ENV_REF}"
      }
    }
  }
}
```

**Detection triggers**: `.github/` directory, GitHub Actions workflows, `@octokit/` packages, GitHub API references, `.github/CODEOWNERS`
**Setup**: Requires GitHub personal access token with repo scope
**Safety**: Use fine-grained tokens scoped to the specific repository. Read-only unless PR/issue management is needed.

---

## Filesystem MCP Server

For projects with heavy file management needs.

```json
{
  "mcpServers": {
    "filesystem": {
      "type": "stdio",
      "command": "npx",
      "args": [
        "-y",
        "@modelcontextprotocol/server-filesystem",
        "{ALLOWED_DIRECTORY_1}",
        "{ALLOWED_DIRECTORY_2}"
      ]
    }
  }
}
```

**Detection triggers**: Asset processing pipelines, document generation, template engines, content management, file upload handling
**Setup**: `npm install -g @modelcontextprotocol/server-filesystem` or use npx
**Safety**: ALWAYS scope to specific directories. Never allow root or home directory access. Typically scope to `./src`, `./content`, `./public`, or `./docs`.

---

## Puppeteer MCP Server

For projects with browser automation or E2E testing.

```json
{
  "mcpServers": {
    "puppeteer": {
      "type": "stdio",
      "command": "npx",
      "args": [
        "-y",
        "@modelcontextprotocol/server-puppeteer"
      ]
    }
  }
}
```

**Detection triggers**: `puppeteer`, `playwright`, `cypress`, E2E test configs, browser automation scripts, web scraping code
**Setup**: `npm install -g @modelcontextprotocol/server-puppeteer` or use npx. Requires Chrome/Chromium.
**Safety**: Browser automation can access any URL. Consider network policies if sensitive internal services exist.

---

## Fetch MCP Server

For projects that interact with external APIs.

```json
{
  "mcpServers": {
    "fetch": {
      "type": "stdio",
      "command": "npx",
      "args": [
        "-y",
        "@anthropic-ai/mcp-fetch"
      ]
    }
  }
}
```

**Detection triggers**: `axios`, `node-fetch`, `got`, `ky`, external API integrations, webhook handlers, REST client usage
**Setup**: `npm install -g @anthropic-ai/mcp-fetch` or use npx
**Safety**: Consider pairing with domain allowlists in settings if the project only calls specific APIs.

---

## Brave Search MCP Server

For projects that need web search capabilities.

```json
{
  "mcpServers": {
    "brave-search": {
      "type": "stdio",
      "command": "npx",
      "args": [
        "-y",
        "@modelcontextprotocol/server-brave-search"
      ],
      "env": {
        "BRAVE_API_KEY": "{BRAVE_API_KEY_ENV_REF}"
      }
    }
  }
}
```

**Detection triggers**: Search functionality, content aggregation, research-heavy workflows, documentation lookup patterns
**Setup**: Requires Brave Search API key from https://brave.com/search/api/
**Safety**: API key should reference environment variable.

---

## Memory MCP Server

For projects where Claude needs to maintain persistent knowledge across sessions.

```json
{
  "mcpServers": {
    "memory": {
      "type": "stdio",
      "command": "npx",
      "args": [
        "-y",
        "@modelcontextprotocol/server-memory"
      ]
    }
  }
}
```

**Detection triggers**: Complex domain models, large codebases with many conventions, projects with frequent context-switching, onboarding-heavy projects
**Setup**: `npm install -g @modelcontextprotocol/server-memory` or use npx
**Safety**: Memory is stored locally. No credentials needed.

---

## Slack MCP Server

For projects with Slack integration.

```json
{
  "mcpServers": {
    "slack": {
      "type": "stdio",
      "command": "npx",
      "args": [
        "-y",
        "@modelcontextprotocol/server-slack"
      ],
      "env": {
        "SLACK_BOT_TOKEN": "{SLACK_BOT_TOKEN_ENV_REF}",
        "SLACK_TEAM_ID": "{SLACK_TEAM_ID_ENV_REF}"
      }
    }
  }
}
```

**Detection triggers**: `@slack/bolt`, `@slack/web-api`, Slack webhook URLs, Slack bot configurations
**Setup**: Requires Slack Bot token and team ID
**Safety**: Use minimal scopes. Never auto-post without user confirmation.

---

## Sentry MCP Server

For projects using Sentry error tracking.

```json
{
  "mcpServers": {
    "sentry": {
      "type": "stdio",
      "command": "npx",
      "args": [
        "-y",
        "@modelcontextprotocol/server-sentry"
      ],
      "env": {
        "SENTRY_AUTH_TOKEN": "{SENTRY_AUTH_TOKEN_ENV_REF}",
        "SENTRY_ORG": "{SENTRY_ORG}",
        "SENTRY_PROJECT": "{SENTRY_PROJECT}"
      }
    }
  }
}
```

**Detection triggers**: `@sentry/node`, `@sentry/react`, `@sentry/browser`, Sentry DSN in configs, `sentry.properties`
**Setup**: Requires Sentry auth token with project:read scope
**Safety**: Read-only access to error reports. Token should reference env var.

---

## Docker MCP Server

For projects using Docker containers.

```json
{
  "mcpServers": {
    "docker": {
      "type": "stdio",
      "command": "docker",
      "args": [
        "run",
        "-i",
        "--rm",
        "mcp/docker"
      ]
    }
  }
}
```

**Detection triggers**: `Dockerfile`, `docker-compose.yml`, `.dockerignore`, container orchestration configs
**Setup**: Requires Docker to be installed and running
**Safety**: Docker commands can be destructive. This MCP should only be recommended with appropriate guardrails.

---

## Configuration Merging Strategy

When generating `mcp.json`, follow this merge strategy:

1. **Read existing** `.claude/mcp.json` if it exists
2. **Never remove** existing MCP server configurations
3. **Add new** recommended servers alongside existing ones
4. **Warn on conflicts** — if an existing config contradicts a recommendation, note it but don't override
5. **Comment with rationale** — explain why each MCP server is recommended (in the generation summary, not in JSON)

## MCP Recommendation Output Format

When presenting MCP recommendations to the user:

```
### Recommended MCP Servers

| Server | Package | Reason | Setup Required |
|--------|---------|--------|----------------|
| {name} | {package} | {why this project needs it} | {what user needs to provide} |

### Setup Instructions
1. {server-name}: {install command}
   - Requires: {env vars or credentials needed}
   - {additional setup steps}
```
