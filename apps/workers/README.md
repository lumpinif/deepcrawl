# DeepCrawl Workers

This is a nested Turborepo containing the worker services for DeepCrawl.

## Structure

This is a nested Turborepo with the following structure:

```
apps/workers/
├── deepcrawl-v0/     # Main worker application
├── packages/         # Shared packages for workers
└── package.json     # Root package.json for the workspace
```

## Getting Started

### Prerequisites

- Node.js >= 18
- pnpm >= 8

### Installation

1. Install dependencies:

```bash
pnpm install
```

### Development

To start the development server:

```bash
pnpm dev
```

### Building

To build all packages and apps:

```bash
pnpm build
```

### Available Scripts

- `dev`: Start development servers
- `build`: Build all packages and apps
- `lint`: Lint all packages and apps
- `typecheck`: Type check all packages and apps
- `format`: Format all code
- `fix`: Run lint and format fixes
- `deploy`: Deploy all packages and apps

## Workspace Packages

This workspace contains the following packages:

- `deepcrawl-v0`: Main worker application
- `packages/*`: Shared packages for workers

## Contributing

1. Create a new branch
2. Make your changes
3. Run tests
4. Submit a pull request

### Remote Caching

> [!TIP]
> Vercel Remote Cache is free for all plans. Get started today at [vercel.com](https://vercel.com/signup?/signup?utm_source=remote-cache-sdk&utm_campaign=free_remote_cache).

Turborepo can use a technique known as [Remote Caching](https://turbo.build/repo/docs/core-concepts/remote-caching) to share cache artifacts across machines, enabling you to share build caches with your team and CI/CD pipelines.

By default, Turborepo will cache locally. To enable Remote Caching you will need an account with Vercel. If you don't have an account you can [create one](https://vercel.com/signup?utm_source=turborepo-examples), then enter the following commands:

```
cd my-turborepo
npx turbo login
```

This will authenticate the Turborepo CLI with your [Vercel account](https://vercel.com/docs/concepts/personal-accounts/overview).

Next, you can link your Turborepo to your Remote Cache by running the following command from the root of your Turborepo:

```
npx turbo link
```

## Useful Links

Learn more about the power of Turborepo:

- [Tasks](https://turbo.build/repo/docs/core-concepts/monorepos/running-tasks)
- [Caching](https://turbo.build/repo/docs/core-concepts/caching)
- [Remote Caching](https://turbo.build/repo/docs/core-concepts/remote-caching)
- [Filtering](https://turbo.build/repo/docs/core-concepts/monorepos/filtering)
- [Configuration Options](https://turbo.build/repo/docs/reference/configuration)
- [CLI Usage](https://turbo.build/repo/docs/reference/command-line-reference)
