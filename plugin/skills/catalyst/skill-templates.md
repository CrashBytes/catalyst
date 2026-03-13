# Catalyst Skill Templates

Reference templates for generating project-specific skills. Each template should be adapted to the actual codebase — replace all placeholders with real paths, commands, and patterns.

---

## test-runner

For projects with testing frameworks.

```markdown
---
name: test-runner
description: "Run and manage tests. Use when user says 'run tests', 'test this', 'add tests', 'fix failing test', 'test coverage'. Runs {TEST_FRAMEWORK} tests following project conventions."
user-invocable: true
argument-hint: "[file-or-pattern] [--watch] [--coverage]"
allowed-tools: Read, Glob, Grep, Bash, Write, Edit
---

# Test Runner

## Context
- Framework: {TEST_FRAMEWORK}
- Config: {TEST_CONFIG_PATH}
- Test location: {TEST_DIRECTORY}
- Naming pattern: {TEST_FILE_PATTERN}

## Workflow

### Running Tests
- All tests: `{TEST_COMMAND}`
- Specific file: `{TEST_COMMAND_SINGLE}`
- Watch mode: `{TEST_WATCH_COMMAND}`
- Coverage: `{TEST_COVERAGE_COMMAND}`

### Writing Tests
When asked to write tests:
1. Read the source file to understand the code
2. Check existing tests in {TEST_DIRECTORY} for patterns
3. Follow the project's test naming convention: {NAMING_PATTERN}
4. Use the project's assertion style: {ASSERTION_STYLE}
5. Include edge cases and error scenarios

### Test Conventions
- {CONVENTION_1}
- {CONVENTION_2}
- Mock patterns: {MOCK_PATTERN}
- Fixture location: {FIXTURE_PATH}
```

---

## api-builder

For projects with API routes.

```markdown
---
name: api-builder
description: "Create and modify API endpoints. Use when user says 'add endpoint', 'create route', 'build API', 'add handler', 'REST endpoint', 'API route'."
user-invocable: true
argument-hint: "[method] [path] [description]"
allowed-tools: Read, Glob, Grep, Bash, Write, Edit
---

# API Builder

## Context
- Framework: {API_FRAMEWORK}
- Routes location: {ROUTES_PATH}
- Style: {REST|GraphQL|tRPC}
- Middleware: {MIDDLEWARE_PATTERN}
- Validation: {VALIDATION_LIBRARY}

## Workflow
1. Determine the endpoint path and HTTP method
2. Check existing routes in {ROUTES_PATH} for patterns
3. Create route following the project pattern:
   - File naming: {FILE_NAMING}
   - Handler pattern: {HANDLER_PATTERN}
   - Response format: {RESPONSE_FORMAT}
4. Add validation using {VALIDATION_LIBRARY}
5. Add error handling following project conventions
6. Add tests if test framework is available

## Route Conventions
- {CONVENTION_1}
- {CONVENTION_2}
- Error format: {ERROR_FORMAT}
- Auth middleware: {AUTH_PATTERN}
```

---

## component-builder

For frontend projects with component libraries.

```markdown
---
name: component-builder
description: "Create and modify UI components. Use when user says 'create component', 'build component', 'add component', 'new component', 'UI component'."
user-invocable: true
argument-hint: "[component-name] [description]"
allowed-tools: Read, Glob, Grep, Write, Edit
---

# Component Builder

## Context
- Framework: {UI_FRAMEWORK}
- Component location: {COMPONENTS_PATH}
- Styling: {CSS_APPROACH}
- State management: {STATE_MANAGEMENT}

## Workflow
1. Create component directory at {COMPONENTS_PATH}/{ComponentName}/
2. Create files following project pattern:
   - {COMPONENT_FILE_PATTERN}
   - {STYLE_FILE_PATTERN}
   - {INDEX_FILE_PATTERN}
   - {TEST_FILE_PATTERN}
3. Follow project's component conventions:
   - Props: {PROPS_PATTERN}
   - Styling: {STYLING_PATTERN}
   - Exports: {EXPORT_PATTERN}

## Conventions
- {CONVENTION_1}
- {CONVENTION_2}
```

---

## db-ops

For projects with databases.

```markdown
---
name: db-ops
description: "Database operations - migrations, queries, schema changes. Use when user says 'migration', 'database', 'schema change', 'add column', 'create table', 'query'."
user-invocable: true
argument-hint: "[migrate|seed|query|schema] [details]"
allowed-tools: Read, Glob, Grep, Bash, Write, Edit
---

# Database Operations

## Context
- Database: {DATABASE}
- ORM: {ORM}
- Migrations: {MIGRATIONS_PATH}
- Schema: {SCHEMA_PATH}

## Workflow

### Migrations
1. Generate: `{MIGRATION_CREATE_COMMAND}`
2. Run: `{MIGRATION_RUN_COMMAND}`
3. Rollback: `{MIGRATION_ROLLBACK_COMMAND}`

### Schema Changes
1. Edit schema at {SCHEMA_PATH}
2. Generate migration
3. Apply migration
4. Update types if applicable

## Conventions
- {CONVENTION_1}
- {CONVENTION_2}
```

---

## deploy

For projects with deployment pipelines.

```markdown
---
name: deploy
description: "Deployment operations. Use when user says 'deploy', 'release', 'publish', 'push to production', 'ship it'. IMPORTANT: Always confirm with user before deploying."
user-invocable: true
disable-model-invocation: true
argument-hint: "[preview|production|staging]"
allowed-tools: Read, Bash, Glob
---

# Deploy

## Context
- Target: {DEPLOY_TARGET}
- Build: `{BUILD_COMMAND}`
- Deploy: `{DEPLOY_COMMAND}`
- Preview: `{PREVIEW_COMMAND}`

## Workflow
1. Run lint and type checks first
2. Run tests
3. Build the project
4. Confirm with user before deploying
5. Deploy to target environment

## Pre-deploy Checklist
- [ ] All tests passing
- [ ] No lint errors
- [ ] No type errors
- [ ] Build succeeds
- [ ] User confirmed deployment
```

---

## content-writer

For content-driven projects (blogs, docs, CMS).

```markdown
---
name: content-writer
description: "Create and manage content. Use when user says 'write article', 'create post', 'add content', 'new page', 'content'."
user-invocable: true
argument-hint: "[content-type] [title]"
allowed-tools: Read, Glob, Grep, Write, Edit
---

# Content Writer

## Context
- Content location: {CONTENT_PATH}
- Format: {CONTENT_FORMAT}
- Schema: {CONTENT_SCHEMA}
- Frontmatter: {FRONTMATTER_PATTERN}

## Workflow
1. Determine content type and location
2. Check existing content for frontmatter patterns
3. Create content file with proper frontmatter
4. Follow content conventions:
   - {CONVENTION_1}
   - {CONVENTION_2}
5. Validate against schema if available

## Frontmatter Template
```yaml
{FRONTMATTER_TEMPLATE}
```

## Conventions
- {CONVENTION_1}
- {CONVENTION_2}
```

---

## refactor

For any substantial codebase.

```markdown
---
name: refactor
description: "Safe code refactoring with validation. Use when user says 'refactor', 'clean up', 'reorganize', 'improve code', 'extract function', 'rename'."
user-invocable: true
argument-hint: "[target-file-or-pattern] [description]"
allowed-tools: Read, Glob, Grep, Bash, Edit
---

# Refactor

## Workflow
1. Understand the current code and its usage
2. Identify all references (Grep for imports, function calls, etc.)
3. Plan the refactoring — present to user
4. Execute changes across all affected files
5. Run tests: `{TEST_COMMAND}`
6. Run lint: `{LINT_COMMAND}`
7. Run type check: `{TYPE_CHECK_COMMAND}`

## Rules
- NEVER change public API without confirmation
- Always update all references
- Run tests after every significant change
- Keep commits atomic — one logical change per refactor
```

---

## env-manager

For projects with multiple environments.

```markdown
---
name: env-manager
description: "Manage environment variables and configuration. Use when user says 'env', 'environment', 'config', 'add env var', 'secret', 'environment variable'."
user-invocable: true
argument-hint: "[add|list|check] [var-name]"
allowed-tools: Read, Glob, Grep, Edit
---

# Environment Manager

## Context
- Env file: {ENV_FILE}
- Example: {ENV_EXAMPLE_FILE}
- Config module: {CONFIG_MODULE}

## Workflow

### Add Variable
1. Add to {ENV_EXAMPLE_FILE} (without real value)
2. Add to {ENV_FILE} (with real value — ask user)
3. Update {CONFIG_MODULE} if it validates env vars
4. Update any documentation

### Check Variables
1. Compare {ENV_FILE} with {ENV_EXAMPLE_FILE}
2. Report missing variables
3. Identify unused variables

## Rules
- NEVER commit .env files with real secrets
- Always update .env.example when adding variables
- Use descriptive variable names with consistent prefixes
```
