# Task Completion Checklist - DeepCrawl

## After Code Changes
1. **Type Checking**: Run `pnpm typecheck` from root
2. **Code Quality**: Run `pnpm check` (includes lint, format, sherif)
3. **Worker-Specific**: If editing workers, run `pnpm check` from worker directory
4. **SDK Testing**: If editing SDK, run tests from `packages/sdks/js-ts/`

## Before Deployment
1. **Worker Type Generation**: `pnpm cf-typegen` (from worker directory)
2. **OpenAPI Generation**: `pnpm gen:openapi` (if API changes)
3. **Database Sync**: If schema changes, run appropriate db:sync commands
4. **Build Verification**: `pnpm build` from root

## Quality Assurance Commands
```bash
# Root level (comprehensive)
pnpm check                 # All checks (typecheck, lint, format, sherif)
pnpm sherif:fix           # Fix dependency issues

# Worker specific
cd apps/workers/v0 && pnpm check
cd apps/workers/auth && pnpm check  
cd apps/app && pnpm check

# SDK testing
cd packages/sdks/js-ts && pnpm test
```

## Environment-Specific Tasks
- **Development**: Use dev servers for testing (`pnpm dev`)
- **Database Changes**: Always run appropriate db:sync commands
- **API Documentation**: Verify via `/docs` endpoints
- **SDK Changes**: Run full test suite with coverage

## Never Auto-Run
- `pnpm dev` or build commands without explicit user request
- Database migrations in production without confirmation
- Deployment commands without explicit instruction

## Validation Methods
- **Manual Testing**: Dev servers and OpenAPI docs endpoints
- **Database Verification**: Use `pnpm db:studio` from packages/db/
- **SDK Testing**: Use `tsx src/test.ts` for local SDK testing
- **API Testing**: Use generated OpenAPI documentation