# Code Style Guidelines - DeepCrawl

## Code Quality Configuration
- **Formatter/Linter**: Biome (biome.jsonc)
- **Line Width**: 80 characters
- **Indentation**: 2 spaces
- **Quotes**: Single quotes for JS/TS, double for JSX
- **Semicolons**: Always required
- **Trailing Commas**: All (except JSON)
- **Import Organization**: Automatic sorting enabled

## TypeScript Guidelines
- **Type Definitions**: Prefer interfaces over types
- **Enums**: Avoid enums, use maps instead
- **Programming Style**: Functional and declarative patterns, avoid classes
- **Variable Naming**: Use descriptive names with auxiliary verbs (isLoading, hasError)
- **Type Safety**: Strict TypeScript configuration across all packages

## React Guidelines
- **Component Strategy**: Prefer Server Components over Client Components
- **Client Components**: Minimize 'use client' usage, wrap in Suspense
- **UI Framework**: shadcn/ui with Tailwind CSS
- **Responsive Design**: Mobile-first approach

## Authentication Patterns
- **Framework**: Better Auth with unlinkAccount method
- **Configuration**: Requires allowUnlinkingAll config for single accounts
- **API Key Auth**: Primary method via x-api-key header or Authorization Bearer
- **Cookie Auth**: Fallback for dashboard users

## Development Practices
- **Commands**: Never automatically run dev/build commands - let users control processes
- **Package Manager**: Always use pnpm (NEVER npm)
- **Testing**: Manual testing via dev servers and OpenAPI docs, Vitest for SDK
- **Error Handling**: Proper error handling with custom error classes

## Accessibility
- **Standards**: Strict accessibility rules enforced
- **Requirements**: Proper ARIA usage, semantic HTML, keyboard navigation
- **Validation**: Enforced via linting rules (some a11y rules disabled in biome.jsonc)

## Linting Rules (Notable)
- No unused variables/imports (warnings)
- Parameter assignment not allowed (error)
- Self-closing elements required (error)
- Fragment syntax preferred (warn)
- No forEach usage (warn)
- Exhaustive dependencies disabled (ESLint handles this)