# Contributing to Deepcrawl

Thank you for your interest in contributing to Deepcrawl! This document provides guidelines and instructions for contributing to the project.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Workflow](#development-workflow)
- [Pull Request Process](#pull-request-process)
- [Code Style Guidelines](#code-style-guidelines)
- [Testing](#testing)
- [Documentation](#documentation)
- [Reporting Bugs](#reporting-bugs)
- [Suggesting Features](#suggesting-features)

## Code of Conduct

This project adheres to a Code of Conduct. By participating, you are expected to uphold this code. Please report unacceptable behavior to the project maintainers.

## Getting Started

### Prerequisites

- **Node.js**: >= 20
- **pnpm**: 10.15.1 (use `corepack enable` to activate)
- **Git**: Latest version

### Initial Setup

1. Fork the repository on GitHub
2. Clone your fork locally:

   ```bash
   git clone https://github.com/YOUR_USERNAME/deepcrawl.git
   cd deepcrawl
   ```

3. Add the upstream repository:

   ```bash
   git remote add upstream https://github.com/ORIGINAL_OWNER/deepcrawl.git
   ```

4. Install dependencies:

   ```bash
   pnpm install
   ```

5. Create a branch for your changes:

   ```bash
   git checkout -b feature/your-feature-name
   ```

### Environment Configuration

- Check `wrangler.jsonc` files in worker directories for service-specific configuration
- Copy `.env.example` to `.env` in relevant packages and configure as needed
- Review `turbo.json` for global environment variables

## Development Workflow

### Running the Project

```bash
# Start all services
pnpm dev

# Start specific services
cd apps/app && pnpm dev              # Dashboard only
cd apps/workers/v0 && pnpm dev       # Deepcrawl worker only
cd apps/workers/auth && pnpm dev     # Auth worker only

# Start combined services
cd apps/app && pnpm dev:workers      # Dashboard + all workers
```

### Making Changes

1. **Make your changes** in a feature branch
2. **Follow code style guidelines** (see below)
3. **Write or update tests** as needed
4. **Update documentation** if you change APIs or add features
5. **Run quality checks**:

   ```bash
   pnpm check           # Run all checks (lint, format, typecheck, sherif)
   pnpm typecheck       # Type check only
   pnpm sherif:fix      # Fix dependency issues
   ```

### Commit Messages

Write clear, concise commit messages following these guidelines:

- Use present tense ("Add feature" not "Added feature")
- Use imperative mood ("Move cursor to..." not "Moves cursor to...")
- Limit the first line to 72 characters
- Reference issues and pull requests when relevant

Examples:

```
feat: add pagination to activity logs endpoint
fix: resolve race condition in cache invalidation
docs: update SDK README with correct API signatures
refactor: extract metadata parsing into separate service
test: add integration tests for links extraction
```

### Branch Naming

Use descriptive branch names with prefixes:

- `feature/` - New features
- `fix/` - Bug fixes
- `docs/` - Documentation updates
- `refactor/` - Code refactoring
- `test/` - Test additions or updates
- `chore/` - Maintenance tasks

Examples:

- `feature/add-pagination-support`
- `fix/cache-invalidation-race`
- `docs/update-api-documentation`

## Pull Request Process

### Before Submitting

1. **Sync with upstream**:

   ```bash
   git fetch upstream
   git rebase upstream/main
   ```

2. **Run all quality checks**:

   ```bash
   // from the project root
   pnpm check
   ```

3. **Ensure tests pass** (if applicable):

   ```bash
   cd packages/sdks/js-ts && pnpm test
   ```

4. **Update documentation** if needed

### Submitting a Pull Request

1. Push your branch to your fork:

   ```bash
   git push origin feature/your-feature-name
   ```

2. Open a pull request on GitHub

3. Fill out the pull request template with:

   - **Description**: Clear explanation of what changes you made and why
   - **Type of Change**: Bug fix, new feature, breaking change, etc.
   - **Testing**: How you tested your changes
   - **Checklist**: Complete the PR checklist

4. Link related issues using keywords:
   - `Fixes #123`
   - `Closes #456`
   - `Related to #789`

### Pull Request Guidelines

- Keep PRs focused on a single concern
- Keep changes as small as possible
- Provide clear descriptions and context
- Respond to review feedback promptly
- Ensure all CI checks pass
- Update your branch if requested

## Code Style Guidelines

This project uses **Biome** for formatting and linting.

### TypeScript Guidelines

- **Use interfaces over types** for object shapes
- **Avoid enums** - use const objects or union types instead
- **Avoid `any` type** - use `unknown` if type is truly unknown
- **Use `export type` for type-only exports**
- **Use `import type` for type-only imports**
- **Use descriptive names** with auxiliary verbs (`isLoading`, `hasError`)

### React Guidelines

- **Prefer Server Components** over Client Components
- **Minimize `'use client'` usage**
- **Wrap Client Components in Suspense boundaries**
- **Use `next/image`** instead of `<img>` tags
- **Use arrow functions** over function expressions
- **Avoid classes** - prefer functional patterns

### Code Quality Rules

- **No unused variables or imports**
- **No console statements** (use proper logging in production)
- **Always provide error handling** with meaningful messages
- **Never hardcode sensitive data** like API keys
- **Use optional chaining** (`?.`) for safe property access
- **Prefer `const`** over `let` when possible

### Accessibility Requirements

- **Always include `lang` attribute** on `<html>` element
- **Provide meaningful alt text** for images
- **Use semantic HTML** elements
- **Ensure keyboard navigation** works properly
- **Include proper ARIA attributes** when needed

### Formatting

Biome will automatically format your code. To manually format:

```bash
pnpm dlx @biomejs/biome format --write .
```

Configuration:

- **Indentation**: 2 spaces
- **Quotes**: Single quotes for strings
- **Semicolons**: Always use semicolons
- **Line width**: 80 characters
- **Trailing commas**: Always

## Testing

### Running Tests

```bash
# SDK tests (Vitest)
cd packages/sdks/js-ts
pnpm test              # Run all tests
pnpm test:watch        # Watch mode
pnpm test:coverage     # With coverage
pnpm test:ui           # UI mode
```

### Manual Testing

For components without automated tests:

- **Development servers**: Test changes with `pnpm dev`
- **OpenAPI docs**: Verify API changes at `/docs` endpoints
- **Database studio**: Check data integrity with `pnpm db:studio`
- **SDK test files**: Create test files and run with `tsx src/test.ts`

### Test Guidelines

- Write tests for new features
- Update tests when modifying existing features
- Ensure tests are deterministic
- Mock external dependencies
- Test edge cases and error scenarios

## Documentation

### When to Update Documentation

- Adding or modifying APIs
- Changing configuration options
- Adding new features
- Fixing bugs that affect documented behavior

### Documentation Types

1. **README files**: High-level overview and getting started guides
2. **API documentation**: Generated from OpenAPI specs and JSDoc comments
3. **Type documentation**: Detailed type information in `packages/types/README.md`
4. **Architecture docs**: Technical details in `CLAUDE.md`

### Documentation Standards

- Keep documentation accurate and up-to-date
- Include code examples for complex features
- Explain the "why" not just the "what"
- Document edge cases and common pitfalls
- Use clear, concise language

## Reporting Bugs

### Before Reporting

1. **Check existing issues** to avoid duplicates
2. **Update to the latest version** to see if the bug persists
3. **Gather relevant information**:
   - Node.js version
   - pnpm version
   - Operating system
   - Steps to reproduce
   - Expected vs actual behavior
   - Error messages and stack traces

### Bug Report Template

Use GitHub Issues with the following information:

```markdown
**Description**
A clear description of the bug.

**To Reproduce**
Steps to reproduce the behavior:

1. Go to '...'
2. Click on '...'
3. See error

**Expected Behavior**
What you expected to happen.

**Actual Behavior**
What actually happened.

**Environment**

- Node.js version: [e.g., 20.10.0]
- pnpm version: [e.g., 10.15.1]
- OS: [e.g., macOS 14.2]
- Package: [e.g., @deepcrawl/sdk@1.0.0]

**Additional Context**
Any other relevant information.
```

## Suggesting Features

### Feature Request Guidelines

- **Explain the problem** your feature would solve
- **Describe your proposed solution** clearly
- **Consider alternatives** and explain why your solution is best
- **Provide examples** of how the feature would be used
- **Think about edge cases** and potential issues

### Feature Request Template

```markdown
**Problem Statement**
What problem does this feature solve?

**Proposed Solution**
Describe your proposed solution.

**Alternatives Considered**
What other solutions did you consider?

**Use Cases**
Provide examples of how this feature would be used.

**Additional Context**
Any other relevant information.
```

## Project Structure

Understanding the monorepo structure:

```
deepcrawl/
├── apps/
│   ├── app/              # Next.js dashboard
│   └── workers/
│       ├── v0/           # Deepcrawl API worker
│       └── auth/         # Authentication worker
├── packages/
│   ├── sdks/js-ts/       # TypeScript SDK
│   ├── db/
│   │   ├── db-auth/      # Auth database (PostgreSQL)
│   │   └── db-d1/        # D1 database (Cloudflare)
│   ├── types/            # Shared TypeScript types
│   ├── contracts/        # API contracts (oRPC)
│   ├── ui/               # shadcn/ui components
│   └── auth/             # Authentication config
└── scripts/              # Build and utility scripts
```

## Additional Resources

- [CLAUDE.md](./CLAUDE.md) - Detailed technical guidelines and architecture
- [README.md](./README.md) - Project overview and quick start
- [SECURITY.md](./SECURITY.md) - Security policy and vulnerability reporting
- [CODE_OF_CONDUCT.md](./CODE_OF_CONDUCT.md) - Community guidelines

## Questions?

If you have questions about contributing, feel free to:

- Open a GitHub Discussion
- Ask in existing issues
- Reach out to maintainers

Thank you for contributing to Deepcrawl!
