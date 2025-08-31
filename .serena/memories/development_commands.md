# Development Commands - DeepCrawl

## Essential Commands (run from root)
```bash
# Development
pnpm dev                    # Start all services
pnpm build                  # Build all services  
pnpm typecheck             # Type check all services
pnpm check                 # Run all checks (typecheck, lint, format, sherif)

# Quality Control
pnpm sherif                # Check dependencies
pnpm sherif:fix            # Fix dependency issues (ignores @types/node)
```

## Worker-Specific Commands
```bash
# DeepCrawl Worker (apps/workers/v0/)
cd apps/workers/v0
pnpm dev                   # Development server (port 8080)
pnpm deploy                # Deploy to production
pnpm cf-typegen           # Generate Cloudflare Worker types
pnpm gen:openapi          # Generate OpenAPI YAML
pnpm check                # Format and lint

# Auth Worker (apps/workers/auth/)
cd apps/workers/auth  
pnpm dev                   # Development server
pnpm deploy                # Deploy to production
```

## Dashboard Commands
```bash
# Dashboard (apps/app/)
cd apps/app
pnpm dev                   # Next.js development
pnpm dev:workers          # Dashboard + all workers
pnpm dev:auth-worker      # Dashboard + auth worker only
pnpm clean                # Clean build artifacts
pnpm clean:node           # Clean node_modules
pnpm ui add [component]   # Add shadcn/ui component
```

## Database Commands
```bash
# Auth Database (packages/db/db-auth/)
cd packages/db/db-auth
pnpm db:generate          # Generate migrations
pnpm db:push              # Push schema changes
pnpm db:studio            # Database studio
pnpm db:sync              # Full sync (generate + migrate)
pnpm db:generate:prod     # Production operations
pnpm db:push:prod
pnpm db:sync:prod

# D1 Database (packages/db/db-d1/)
cd packages/db/db-d1
pnpm db:create            # Create D1 database
pnpm db:generate          # Generate D1 migrations
pnpm db:push              # Push D1 schema changes
pnpm db:studio            # D1 database studio
pnpm db:migrate           # Migrate D1 database
pnpm db:sync              # Full D1 sync
```

## SDK Development Commands
```bash
# TypeScript SDK (packages/sdks/js-ts/)
cd packages/sdks/js-ts
pnpm build                # Build for distribution
pnpm dev                  # Watch mode development
pnpm test                 # Run tests
pnpm test:watch           # Tests in watch mode
pnpm test:ui              # Tests with UI
pnpm test:coverage        # Tests with coverage
tsx src/test.ts           # Run local test file
```

## Authentication Commands
```bash
# Auth Package (packages/auth/)
cd packages/auth
pnpm auth:generate        # Generate auth schema
pnpm email:dev            # Email template development
pnpm email:export         # Export email templates
```