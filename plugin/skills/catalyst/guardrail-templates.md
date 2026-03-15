# Catalyst Guardrail Templates

Reference templates for generating project-specific guardrails. Guardrails protect against unintended destructive actions, enforce code quality, and maintain security boundaries. Adapt to the actual codebase — replace all placeholders with real values.

---

## Universal Deny Rules

These deny rules should be applied to ALL projects. They prevent catastrophic actions that are almost never intentional.

```json
{
  "permissions": {
    "deny": [
      "Bash(rm -rf /*)",
      "Bash(rm -rf ~/*)",
      "Bash(rm -rf ./*)",
      "Bash(git push --force *main*)",
      "Bash(git push --force *master*)",
      "Bash(git push -f *main*)",
      "Bash(git push -f *master*)",
      "Bash(git reset --hard*)",
      "Bash(git clean -fd*)",
      "Bash(*DROP DATABASE*)",
      "Bash(*DROP TABLE*)",
      "Bash(*TRUNCATE TABLE*)",
      "Bash(*--no-verify*)"
    ]
  }
}
```

---

## Node.js / JavaScript Project Guardrails

For projects using npm/yarn/pnpm.

### Deny Rules
```json
{
  "permissions": {
    "deny": [
      "Bash(npm publish*)",
      "Bash(yarn publish*)",
      "Bash(pnpm publish*)",
      "Edit(file_path:**/package-lock.json)",
      "Edit(file_path:**/yarn.lock)",
      "Edit(file_path:**/pnpm-lock.yaml)",
      "Edit(file_path:**/.env.production*)",
      "Edit(file_path:**/.env.staging*)",
      "Write(file_path:**/package-lock.json)",
      "Write(file_path:**/yarn.lock)",
      "Write(file_path:**/pnpm-lock.yaml)"
    ]
  }
}
```

### Hooks
```json
{
  "hooks": {
    "PostToolUse": [
      {
        "matcher": "Edit|Write",
        "hook": "if echo \"$TOOL_INPUT\" | grep -qE '\\.(ts|tsx|js|jsx)$'; then npx {LINTER} --quiet \"$(echo \"$TOOL_INPUT\" | grep -oE '[^\"]+\\.(ts|tsx|js|jsx)')\"; fi",
        "description": "Run linter on changed JS/TS files"
      }
    ]
  }
}
```

**Detection triggers**: `package.json`, `node_modules/`, `.npmrc`, `.nvmrc`

---

## Python Project Guardrails

For Python projects.

### Deny Rules
```json
{
  "permissions": {
    "deny": [
      "Bash(pip install* --break-system-packages*)",
      "Bash(twine upload*)",
      "Bash(python setup.py upload*)",
      "Edit(file_path:**/poetry.lock)",
      "Edit(file_path:**/Pipfile.lock)",
      "Edit(file_path:**/.env.production*)",
      "Write(file_path:**/poetry.lock)",
      "Write(file_path:**/Pipfile.lock)"
    ]
  }
}
```

### Hooks
```json
{
  "hooks": {
    "PostToolUse": [
      {
        "matcher": "Edit|Write",
        "hook": "if echo \"$TOOL_INPUT\" | grep -qE '\\.py$'; then {LINTER} check \"$(echo \"$TOOL_INPUT\" | grep -oE '[^\"]+\\.py')\"; fi",
        "description": "Run linter on changed Python files"
      }
    ]
  }
}
```

**Detection triggers**: `pyproject.toml`, `requirements.txt`, `setup.py`, `Pipfile`, `poetry.lock`

---

## Rust Project Guardrails

For Rust projects.

### Deny Rules
```json
{
  "permissions": {
    "deny": [
      "Bash(cargo publish*)",
      "Edit(file_path:**/Cargo.lock)",
      "Write(file_path:**/Cargo.lock)"
    ]
  }
}
```

### Hooks
```json
{
  "hooks": {
    "PostToolUse": [
      {
        "matcher": "Edit|Write",
        "hook": "if echo \"$TOOL_INPUT\" | grep -qE '\\.rs$'; then cargo clippy --quiet 2>&1 | head -20; fi",
        "description": "Run clippy on Rust file changes"
      }
    ]
  }
}
```

**Detection triggers**: `Cargo.toml`, `Cargo.lock`, `.rs` files

---

## Go Project Guardrails

For Go projects.

### Deny Rules
```json
{
  "permissions": {
    "deny": [
      "Edit(file_path:**/go.sum)",
      "Write(file_path:**/go.sum)"
    ]
  }
}
```

### Hooks
```json
{
  "hooks": {
    "PostToolUse": [
      {
        "matcher": "Edit|Write",
        "hook": "if echo \"$TOOL_INPUT\" | grep -qE '\\.go$'; then gofmt -l \"$(echo \"$TOOL_INPUT\" | grep -oE '[^\"]+\\.go')\" && go vet ./...; fi",
        "description": "Run gofmt and go vet on changed Go files"
      }
    ]
  }
}
```

**Detection triggers**: `go.mod`, `go.sum`, `.go` files

---

## Database Project Guardrails

For projects with database access.

### Deny Rules
```json
{
  "permissions": {
    "deny": [
      "Bash(*DROP DATABASE*)",
      "Bash(*DROP TABLE*)",
      "Bash(*TRUNCATE*)",
      "Bash(*DELETE FROM* WHERE 1*)",
      "Bash(*DELETE FROM* --no-where*)",
      "Bash(prisma migrate reset*)",
      "Bash(prisma db push --force*)",
      "Bash(*migrate:reset*)",
      "Bash(*db:drop*)",
      "Bash(*db:destroy*)"
    ]
  }
}
```

### CLAUDE.md Rules
```markdown
## Database Safety
- NEVER run destructive migrations without explicit user approval
- NEVER connect to production databases from development environment
- Always create reversible migrations with proper up/down methods
- Always back up data before running schema-altering migrations
- Test migrations against a fresh database before applying to development
```

**Detection triggers**: Prisma, Drizzle, TypeORM, Sequelize, Knex, SQLAlchemy, GORM, ActiveRecord, migration files

---

## Infrastructure / DevOps Guardrails

For projects with infrastructure-as-code.

### Deny Rules
```json
{
  "permissions": {
    "deny": [
      "Bash(terraform destroy*)",
      "Bash(terraform apply -auto-approve*)",
      "Bash(pulumi destroy*)",
      "Bash(kubectl delete namespace*)",
      "Bash(kubectl delete -f*)",
      "Bash(aws * delete-*)",
      "Bash(aws * terminate-*)",
      "Bash(cdk destroy*)",
      "Edit(file_path:**/terraform.tfstate*)",
      "Edit(file_path:**/*.tfvars)",
      "Write(file_path:**/terraform.tfstate*)"
    ]
  }
}
```

### CLAUDE.md Rules
```markdown
## Infrastructure Safety
- NEVER run `terraform apply` or `pulumi up` without user review of the plan
- NEVER modify terraform state files directly
- NEVER delete cloud resources without explicit confirmation
- Always run `terraform plan` first and present the changes
- Always check for dependent resources before deletion
```

**Detection triggers**: Terraform files (`.tf`), Pulumi configs, CloudFormation templates, Kubernetes manifests, Dockerfiles, CDK configs

---

## CI/CD Pipeline Guardrails

For projects with CI/CD configurations.

### Deny Rules
```json
{
  "permissions": {
    "deny": [
      "Edit(file_path:**/.github/workflows/*)",
      "Write(file_path:**/.github/workflows/*)",
      "Edit(file_path:**/.gitlab-ci.yml)",
      "Edit(file_path:**/Jenkinsfile)",
      "Edit(file_path:**/.circleci/config.yml)"
    ]
  }
}
```

### CLAUDE.md Rules
```markdown
## CI/CD Safety
- NEVER modify CI/CD pipeline files without explicit user approval
- Changes to workflows can affect deployments, billing, and security
- Always review workflow changes in a PR before merging
```

**Detection triggers**: `.github/workflows/`, `.gitlab-ci.yml`, `Jenkinsfile`, `.circleci/`, `.travis.yml`

---

## Security-Sensitive Project Guardrails

For projects handling auth, payments, or user data.

### Deny Rules
```json
{
  "permissions": {
    "deny": [
      "Edit(file_path:**/.env*)",
      "Write(file_path:**/.env*)",
      "Edit(file_path:**/*secret*)",
      "Edit(file_path:**/*credential*)",
      "Edit(file_path:**/*.pem)",
      "Edit(file_path:**/*.key)",
      "Edit(file_path:**/*.cert)",
      "Write(file_path:**/*.pem)",
      "Write(file_path:**/*.key)",
      "Write(file_path:**/*.cert)"
    ]
  }
}
```

### Hooks
```json
{
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "Edit|Write",
        "hook": "if echo \"$TOOL_INPUT\" | grep -qEi '(password|secret|api_key|token|private_key|credential)\\s*[:=]\\s*[\"'\\']?[^${}]'; then echo 'BLOCKED: Potential secret detected in file content' && exit 1; fi",
        "description": "Block writes that appear to contain hardcoded secrets"
      }
    ]
  }
}
```

### CLAUDE.md Rules
```markdown
## Security Boundaries
- NEVER hardcode secrets, API keys, tokens, or passwords in source code
- NEVER commit .env files or files containing credentials
- NEVER log sensitive user data (passwords, tokens, PII)
- NEVER disable CSRF/XSS/CORS protections without explicit approval
- Always use environment variables for secrets
- Always sanitize user input before database queries
- Always use parameterized queries — never string concatenation for SQL
```

**Detection triggers**: Auth middleware, JWT usage, OAuth configs, payment SDK (Stripe, PayPal), user model with PII fields, encryption utilities, session management

---

## Frontend Project Guardrails

For React/Vue/Svelte/Angular projects.

### Deny Rules
```json
{
  "permissions": {
    "deny": [
      "Edit(file_path:**/public/index.html)",
      "Edit(file_path:**/.env.production*)"
    ]
  }
}
```

### CLAUDE.md Rules
```markdown
## Frontend Safety
- NEVER use `dangerouslySetInnerHTML` without explicit sanitization
- NEVER disable ESLint rules with inline comments without justification
- NEVER import from `node_modules` paths directly — use package names
- Always use the project's component patterns (check existing components first)
- Always handle loading and error states in async operations
```

**Detection triggers**: React, Vue, Svelte, Angular, Next.js, Nuxt, SvelteKit, component directories

---

## Monorepo Guardrails

For monorepo projects.

### Deny Rules
```json
{
  "permissions": {
    "deny": [
      "Edit(file_path:**/turbo.json)",
      "Edit(file_path:**/nx.json)",
      "Edit(file_path:**/lerna.json)",
      "Edit(file_path:**/pnpm-workspace.yaml)"
    ]
  }
}
```

### CLAUDE.md Rules
```markdown
## Monorepo Safety
- NEVER modify workspace configuration files without review
- NEVER add cross-package dependencies without discussing architecture implications
- Always check which packages are affected by your changes
- Always run tests for affected packages, not just the one you modified
```

**Detection triggers**: `turbo.json`, `nx.json`, `lerna.json`, `pnpm-workspace.yaml`, workspace configs in `package.json`

---

## Guardrail Merging Strategy

When generating guardrails, follow this merge strategy:

1. **Always start with Universal deny rules** — these apply to every project
2. **Layer language-specific guardrails** based on detected language(s)
3. **Add domain-specific guardrails** based on detected patterns (database, infra, security, etc.)
4. **Read existing settings** before writing — merge deny lists and hooks
5. **Never remove existing deny rules** — only add new ones
6. **Deduplicate** — don't add deny rules that already exist
7. **Sort by severity** — critical denials first, then important, then advisory

## Guardrail Output Format

When presenting guardrails to the user:

```
### Generated Guardrails

#### Deny Rules ({N} rules)
| Rule | Category | Reason |
|------|----------|--------|
| `{deny_pattern}` | {category} | {why this is blocked} |

#### Hooks ({N} hooks)
| Event | Matcher | Action | Purpose |
|-------|---------|--------|---------|
| {Pre/PostToolUse} | {matcher} | {hook_command} | {what it does} |

#### CLAUDE.md Safety Rules ({N} rules)
- {rule_1}
- {rule_2}

#### Protected Files ({N} files)
| File Pattern | Reason |
|-------------|--------|
| `{pattern}` | {why it's protected} |
```
