# DeepCrawl Dashboard

Next.js dashboard application for managing the DeepCrawl service.

## Development

```bash
# Start development server with Turbo
pnpm dev

# Start with all workers (dashboard + auth + api)
pnpm dev:workers

# Start with auth worker only  
pnpm dev:auth-worker
```

## Features

- User authentication with Better Auth
- API key management
- Usage analytics and monitoring
- shadcn/ui components with Tailwind CSS
- TanStack Query for server state

## Adding Components

```bash
# Add shadcn/ui components
pnpm ui add button
```
