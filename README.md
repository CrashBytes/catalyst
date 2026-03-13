# Catalyst by CrashBytes

Analyze any codebase and generate optimized Claude Code configurations — skills, agents, CLAUDE.md, and settings — in seconds.

## What It Does

Catalyst deeply analyzes your codebase and generates:

- **CLAUDE.md** — Project context, conventions, commands, and critical rules so Claude understands your codebase from the first message
- **Skills** — Tailored workflow automations based on your actual tech stack (test runner, API builder, component builder, deployment, etc.)
- **Agents** — Specialized sub-agents for code review, architecture design, test writing, and security auditing — configured for your specific patterns
- **Settings** — Granular permission allowlists so Claude can work efficiently without constant permission prompts

## Install

```bash
# Install globally
npm install -g @crashbytes/catalyst

# Or use npx
npx @crashbytes/catalyst init
```

## Usage

### CLI

```bash
# Install Catalyst into your project
cd your-project
catalyst init

# Check installation status
catalyst status

# Remove Catalyst from your project
catalyst remove
```

### Claude Code Commands

After installing, use these in Claude Code:

```
/catalyst              Full analysis + generate everything
/catalyst analyze      Analysis report only (no files generated)
/catalyst skills       Generate skills only
/catalyst agents       Generate agents only
/catalyst claudemd     Generate CLAUDE.md only
/catalyst settings     Generate settings.local.json only
```

## What Gets Analyzed

- **Tech Stack** — Languages, frameworks, libraries, build tools, databases, deployment targets
- **Architecture** — Code organization patterns, directory structure, entry points
- **Code Patterns** — API routes, database access, auth, error handling, validation, state management
- **Conventions** — Naming, imports, file organization, testing patterns, commit style
- **Dev Workflow** — Build commands, dev server, test runner, linter, deployment pipeline
- **Git History** — Branch conventions, commit style, active development areas

## What Gets Generated

### CLAUDE.md
A concise (<200 lines) project reference containing:
- Tech stack summary
- Key directories and entry points
- Common commands (dev, build, test, deploy)
- Code conventions and critical rules
- Schema/validation warnings

### Skills (based on detected patterns)
| Detection | Generated Skill |
|-----------|----------------|
| Test framework | `test-runner` — run, write, and manage tests |
| API routes | `api-builder` — create endpoints following project patterns |
| UI components | `component-builder` — scaffold components with proper conventions |
| Database/ORM | `db-ops` — migrations, schema changes, queries |
| CI/CD pipeline | `deploy` — build, validate, and deploy |
| Content files | `content-writer` — create content with proper frontmatter |
| Docker | `containerize` — Docker operations |
| Multiple envs | `env-manager` — environment variable management |

### Agents (based on project characteristics)
| Detection | Generated Agent |
|-----------|----------------|
| Any project | `code-reviewer` — bug detection, security, conventions |
| Test framework | `test-writer` — write tests following project patterns |
| Complex architecture | `code-architect` — design approaches, evaluate trade-offs |
| Large codebase | `code-explorer` — trace execution paths, map dependencies |
| Auth/security | `security-auditor` — OWASP checks, auth review |
| Database/API | `performance-analyzer` — N+1 queries, missing indexes |

### Settings
- Granular bash permissions for detected package manager, build tools, test runners
- Git operation permissions
- Web fetch domains for detected framework documentation
- Never auto-allows destructive operations

## Philosophy

- **Specific, not generic** — every generated file references your actual paths, patterns, and conventions
- **Quality over quantity** — fewer, better skills beat many mediocre ones
- **Merge, never overwrite** — respects existing Claude Code configuration
- **Convention-aware** — detects and encodes your project's established patterns
- **Security-first** — never auto-allows destructive operations or broad permissions

## Project Structure

```
catalyst/
├── bin/catalyst.js              # CLI entry point
├── plugin/
│   ├── .claude-plugin/
│   │   └── plugin.json          # Plugin manifest
│   ├── skills/catalyst/
│   │   ├── SKILL.md             # Main analysis + generation skill
│   │   ├── skill-templates.md   # Templates for generating skills
│   │   └── agent-templates.md   # Templates for generating agents
│   ├── commands/
│   │   └── catalyst.md          # /catalyst command
│   └── agents/
│       └── codebase-analyzer.md # Analysis agent
├── package.json
└── README.md
```

## License

MIT - CrashBytes
