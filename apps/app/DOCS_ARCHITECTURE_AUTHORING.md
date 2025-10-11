Below is a complete documentation architecture and authoring framework tailored for Deepcrawl’s monorepo, Fumadocs (v15.8.5) on Next.js, and your intended developer audiences. It is scoped to ≤3 levels deep, Diátaxis-aligned, JSON-serializable for your nav, and includes checklists, code standards, verification hooks, and contributor workflow.

1) Information Architecture (IA) — top-level sections
•  Get Started
•  Tutorials
•  Guides
•  Reference
•  Concepts
•  Integrations
•  Contribute

2) JSON-serializable navigation tree (Fumadocs-ready)
You can adapt this object to your Fumadocs navigation data file or loader. Slugs map to MDX files nested under a docs root (e.g., apps/app/content/docs).

```json
{
  "root": {
    "title": "Deepcrawl Docs",
    "version": "v0.4.x",
    "sections": [
      {
        "title": "Get Started",
        "slug": "get-started",
        "children": [
          { "title": "Overview", "slug": "overview" },
          { "title": "Installation", "slug": "installation" },
          { "title": "First Crawl (Node)", "slug": "first-crawl-node" },
          { "title": "First Crawl (Next.js Server Action)", "slug": "first-crawl-nextjs" },
          { "title": "API Keys & Rate Limits", "slug": "api-keys-rate-limits" }
        ]
      },
      {
        "title": "Tutorials",
        "slug": "tutorials",
        "children": [
          { "title": "Cloudflare Worker with Deepcrawl SDK", "slug": "worker-sdk" },
          { "title": "Integrate Deepcrawl in Next.js Server Actions", "slug": "nextjs-server-actions" },
          { "title": "Build an AI Agent Plugin using Deepcrawl", "slug": "ai-agent-plugin" },
          { "title": "(Future) Scheduled Tasks with Vercel Cron", "slug": "scheduled-tasks-future" }
        ]
      },
      {
        "title": "Guides",
        "slug": "guides",
        "children": [
          { "title": "Authentication (API key & Session)", "slug": "auth" },
          { "title": "Rate Limiting & Retries", "slug": "rate-limit-retry" },
          { "title": "Reading & Parsing (Markdown, HTML, Links)", "slug": "reading-parsing" },
          { "title": "Logs & Persistence (D1 + Neon)", "slug": "logs-persistence" },
          { "title": "Puppeteer for JS-rendered pages", "slug": "puppeteer" },
          { "title": "Error Handling Best Practices", "slug": "error-handling" }
        ]
      },
      {
        "title": "Reference",
        "slug": "reference",
        "children": [
          { "title": "HTTP API Endpoints", "slug": "http-api" },
          { "title": "oRPC Contracts", "slug": "orpc" },
          { "title": "SDK: DeepcrawlApp & Methods", "slug": "sdk" },
          { "title": "Configuration & Environment", "slug": "config-env" },
          { "title": "Errors & Status Codes", "slug": "errors" }
        ]
      },
      {
        "title": "Concepts",
        "slug": "concepts",
        "children": [
          { "title": "Architecture Overview (Hono + oRPC + Drizzle)", "slug": "architecture" },
          { "title": "Data Flow (auth → read → logs)", "slug": "data-flow" },
          { "title": "Runtime & Caching (Workers + KV)", "slug": "runtime-caching" },
          { "title": "Type Safety via Contracts", "slug": "type-safety" },
          { "title": "Performance & Limits", "slug": "performance-limits" }
        ]
      },
      {
        "title": "Integrations",
        "slug": "integrations",
        "children": [
          { "title": "Cloudflare Wrangler Deployment", "slug": "cloudflare-wrangler" },
          { "title": "Neon/Postgres + Cloudflare D1", "slug": "neon-d1" },
          { "title": "Next.js Server Actions", "slug": "nextjs" },
          { "title": "Puppeteer on Workers", "slug": "puppeteer-workers" },
          { "title": "(Future) S3/R2 Integration", "slug": "r2-future" }
        ]
      },
      {
        "title": "Contribute",
        "slug": "contribute",
        "children": [
          { "title": "Local Dev Setup", "slug": "local-dev" },
          { "title": "Docs Authoring (Fumadocs)", "slug": "docs-authoring" },
          { "title": "Style & Linting", "slug": "style-linting" },
          { "title": "Versioning & Releases", "slug": "versioning-releases" },
          { "title": "Roadmap & Open Issues", "slug": "roadmap" }
        ]
      }
    ]
  }
}
```

3) Section outlines: title, audience, prerequisites, learning outcomes
Get Started
•  Overview
◦  Audience: All
◦  Prerequisites: None
◦  Outcomes: Understand what Deepcrawl is, supported runtimes, stability (pre-1.0), API surface (HTTP, oRPC, SDK).
•  Installation
◦  Audience: All
◦  Prerequisites: Node 18+ (SDK), Node 20+ workspace, pnpm
◦  Outcomes: Install deepcrawl via pnpm, set up environment variables, confirm versions.
•  First Crawl (Node)
◦  Audience: Full-stack/back-end
◦  Prerequisites: API key, Node 18+
◦  Outcomes: Run readUrl + getMarkdown from a Node script, handle a basic error, print metadata.
•  First Crawl (Next.js Server Action)
◦  Audience: Next.js developers
◦  Prerequisites: Next.js 15, server actions enabled
◦  Outcomes: Use SDK inside a server action, secure env usage, return Markdown to a page.
•  API Keys & Rate Limits
◦  Audience: All
◦  Prerequisites: Dashboard or env access
◦  Outcomes: Where to provision/manage API keys, how rate limits work, retry behavior in SDK.

Tutorials
•  Cloudflare Worker with Deepcrawl SDK
◦  Audience: Workers devs
◦  Prerequisites: Wrangler, nodejs_compat, API key
◦  Outcomes: A deployed worker that calls Deepcrawl read endpoint via SDK, with logging and caching notes.
•  Integrate Deepcrawl in Next.js Server Actions
◦  Audience: Next.js devs
◦  Prerequisites: Next.js 15 server-only context
◦  Outcomes: Production-safe server action pattern with error UI.
•  Build an AI Agent Plugin using Deepcrawl
◦  Audience: AI/Agent devs
◦  Prerequisites: Familiarity with agents, env secrets
◦  Outcomes: Minimal agent that calls SDK, prompt design for retries and rate limits.
•  (Future) Scheduled Tasks with Vercel Cron
◦  Audience: Full-stack
◦  Prerequisites: Vercel
◦  Outcomes: Marked as future; link to roadmap.

Guides
•  Authentication (API key & Session)
◦  Audience: Intermediate
◦  Prerequisites: API key and/or session cookie flow
◦  Outcomes: Implement auth headers, session-based auth via dashboard app, security notes.
•  Rate Limiting & Retries
◦  Audience: Intermediate
◦  Prerequisites: Basic SDK usage
◦  Outcomes: How rate limits are enforced (Hono middleware), SDK retry/backoff knobs, recommended max concurrency.
•  Reading & Parsing (Markdown, HTML, Links)
◦  Audience: Intermediate
◦  Prerequisites: Basic SDK/HTTP usage
◦  Outcomes: Choose between markdown/raw HTML/cleaned HTML, link classification (internal/external/social/email/phone), metadata toggles.
•  Logs & Persistence (D1 + Neon)
◦  Audience: Intermediate
◦  Prerequisites: Drizzle basics
◦  Outcomes: How logs are stored, querying logs via API and dashboard, retention/cost tips.
•  Puppeteer for JS-rendered pages
◦  Audience: Advanced
◦  Prerequisites: Workers + Puppeteer experience
◦  Outcomes: When/why to render JS, resource constraints, timeouts, cost and reliability trade-offs.
•  Error Handling Best Practices
◦  Audience: All
◦  Prerequisites: None
◦  Outcomes: Recognize common failure modes (rate limit, robots, network), implement structured logging, retries with jitter.

Reference
•  HTTP API Endpoints
◦  Audience: All
◦  Prerequisites: None
◦  Outcomes: Stable endpoint docs for /read, /links, /logs, /openapi, /docs with request/response shapes and examples; note: check openapi at https://api.deepcrawl.dev/openapi.
•  oRPC Contracts
◦  Audience: Intermediate–Advanced
◦  Prerequisites: Familiarity with RPC contracts
◦  Outcomes: Contract namespaces (read, links, logs) and typed responses; link to @deepcrawl/contracts.
•  SDK: DeepcrawlApp & Methods
◦  Audience: All
◦  Prerequisites: TypeScript basics
◦  Outcomes: Constructor options, readUrl/getMarkdown/link extraction examples, retry config, typed responses.
•  Configuration & Environment
◦  Audience: All
◦  Prerequisites: None
◦  Outcomes: Constructor vs env vars, Node vs Workers differences, worker compatibility settings, wrangler config pointers.
•  Errors & Status Codes
◦  Audience: All
◦  Prerequisites: None
◦  Outcomes: HTTP status matrix, typed error objects (when applicable), troubleshooting and remediation.

Concepts
•  Architecture Overview (Hono + oRPC + Drizzle)
◦  Audience: Intermediate–Advanced
◦  Prerequisites: Server-side architecture familiarity
◦  Outcomes: How API worker, auth worker, and dashboard relate; Hono routing; oRPC flow; database layer.
•  Data Flow (auth → read → logs)
◦  Audience: Intermediate
◦  Prerequisites: Overview
◦  Outcomes: Request lifecycle from auth to read to persistence; caching.
•  Runtime & Caching (Workers + KV)
◦  Audience: Intermediate
◦  Prerequisites: Cloudflare basics
◦  Outcomes: KV cache strategy, TTL concepts, idempotency notes.
•  Type Safety via Contracts
◦  Audience: Intermediate–Advanced
◦  Prerequisites: TypeScript, zod or schema familiarity
◦  Outcomes: How contracts and schemas ensure type safety across SDK/HTTP/oRPC.
•  Performance & Limits
◦  Audience: Intermediate–Advanced
◦  Prerequisites: None
◦  Outcomes: Concurrency tips, timeouts, worker limits, Puppeteer caveats.

Integrations
•  Cloudflare Wrangler Deployment
◦  Audience: Advanced
◦  Prerequisites: Wrangler, CF account
◦  Outcomes: Deploy worker(s), environment bindings (KV/D1), nodejs_compat, CI tips.
•  Neon/Postgres + Cloudflare D1
◦  Audience: Advanced
◦  Prerequisites: Drizzle ORM familiarity
◦  Outcomes: Connecting to Neon for auth DB, D1 for logs, schema evolution notes.
•  Next.js Server Actions
◦  Audience: Intermediate
◦  Prerequisites: Next.js 15
◦  Outcomes: Server-only usage patterns, caching strategies (ISR vs on-demand fetch).
•  Puppeteer on Workers
◦  Audience: Advanced
◦  Prerequisites: Puppeteer + Workers
◦  Outcomes: Headless rendering strategy, queueing, fallback to non-render pipeline.
•  (Future) S3/R2 Integration
◦  Audience: Advanced
◦  Prerequisites: Storage experience
◦  Outcomes: Marked as future; link to roadmap.

Contribute
•  Local Dev Setup
◦  Audience: Contributors
◦  Prerequisites: pnpm, Node 20+
◦  Outcomes: Run repo locally, dev servers, workspace scripts.
•  Docs Authoring (Fumadocs)
◦  Audience: Contributors
◦  Prerequisites: MDX, Next.js basics
◦  Outcomes: Add/modify MDX content, nav updates, local preview workflow.
•  Style & Linting
◦  Audience: Contributors
◦  Prerequisites: None
◦  Outcomes: Biome + ESLint + Prettier usage for TS; suggested MDX/links linting.
•  Versioning & Releases
◦  Audience: Maintainers
◦  Prerequisites: SemVer
◦  Outcomes: Pre-1.0 policy, tagging, changelog notes, SDK release cadence.
•  Roadmap & Open Issues
◦  Audience: All
◦  Prerequisites: None
◦  Outcomes: Known limitations and planned work, help wanted.

4) Diátaxis mapping
•  Tutorials: Tutorials
•  Guides: How-to guides
•  Concepts: Explanations
•  Reference: API/SDK/config/error reference
•  Get Started: Quickstart + orientation (bridges into tutorials/guides)
•  Integrations: Mixed; bias to How-to with framework-specific context
•  Contribute: Maintainer/development guides (How-to) + process reference

5) Authoring checklists
Global authoring checklist (every page)
•  State audience and goal in the first 2–3 sentences.
•  No unreleased features unless labeled Future or Experimental; clearly warn that SDK is pre-1.0.
•  Framework-neutral by default; if scoped, say “If you’re using Next.js…” explicitly.
•  Provide TypeScript-only examples that run on Node 18+ or Workers; avoid browser code.
•  Include at least one error handling path and, where relevant, a logging example.
•  Link to at least two related pages (next steps or deeper reference).
•  Verify locally: code snippets compile, curl examples work, screenshots current.
•  Pass build, typecheck, lint, and link check locally.
•  Use consistent terminology: “Workers”, “Next.js Server Actions”, “KV”, “D1”.
•  Add stability badges where relevant: Stable, Experimental, Future.

Tutorial checklist
•  Linear, numbered steps with a single clear outcome.
•  Include prerequisites (versions, env vars).
•  Provide final working code sample.
•  Include a verification step (e.g., curl response, console output).
•  Time-to-complete estimate and troubleshooting tips.

How-to (Guide) checklist
•  Start with “When to use this” and “Prerequisites”.
•  Present decision points and recommended defaults.
•  Provide minimal, focused code blocks for the task.
•  Include rollback or cleanup steps if applicable.
•  Link to reference for parameters/types.

Reference checklist
•  Be exhaustive and stable; list every endpoint/method with parameters and types.
•  Provide short, validated examples for each operation.
•  Document error models and status codes.
•  Avoid narrative; link out to guides for usage patterns.
•  Keep request/response schemas in sync with contracts and openapi.

Concept (Explanation) checklist
•  Explain the why and trade-offs.
•  Include diagrams or sequence flows where helpful.
•  Reference concrete examples but don’t embed large code blocks.
•  Call out performance implications and limitations.

6) Code standards and example patterns
•  Language/runtime
◦  TypeScript only (ESM). Avoid CommonJS.
◦  Server-only: Node 18+ (SDK), Workers with nodejs_compat; Next.js 15 Server Actions only.
•  Imports and execution
◦  Include imports, construct clients with env vars, no inline secrets.
◦  Show minimal runnable snippets with explicit error handling.
•  Differences across runtimes
◦  Call out env access differences (process.env vs env binding).
◦  Note Workers constraints (CPU time, memory, Puppeteer usage).
•  Example: Node script (read Markdown + metadata)

```ts
import { DeepcrawlApp } from "deepcrawl";

const apiKey = process.env.DEEPCRAWL_API_KEY;
if (!apiKey) {
  console.error("Missing DEEPCRAWL_API_KEY");
  process.exit(1);
}

const dc = new DeepcrawlApp({ apiKey });

async function main() {
  try {
    const res = await dc.readUrl({
      url: "https://example.com",
      markdown: true,
      metadata: true
    });
    console.log(res.markdown?.slice(0, 200));
    console.log(res.metadata?.title);
  } catch (e) {
    console.error("Read failed:", e instanceof Error ? e.message : e);
    process.exit(1);
  }
}

main();
```

•  Example: Next.js Server Action

```ts
"use server";

import { DeepcrawlApp } from "deepcrawl";

export async function readExample(url: string) {
  const apiKey = process.env.DEEPCRAWL_API_KEY;
  const dc = new DeepcrawlApp({ apiKey });
  try {
    const res = await dc.getMarkdown({ url });
    return res.markdown;
  } catch (e) {
    // Surface a user-friendly error
    return `Error: ${(e as Error).message}`;
  }
}
```

•  Example: Cloudflare Worker route (Hono + SDK)

```ts
import { Hono } from "hono";
import { DeepcrawlApp } from "deepcrawl";

type Env = {
  DEEPCRAWL_API_KEY: string;
};

const app = new Hono<{ Bindings: Env }>();

app.get("/read", async (c) => {
  const url = c.req.query("url");
  if (!url) return c.text("Missing ?url=", 400);

  const dc = new DeepcrawlApp({ apiKey: c.env.DEEPCRAWL_API_KEY });
  try {
    const res = await dc.readUrl({ url, markdown: true, metadata: true });
    return c.json({ title: res.metadata?.title, markdown: res.markdown });
  } catch (e) {
    return c.json({ error: (e as Error).message }, 500);
  }
});

export default {
  fetch: app.fetch
};
```

•  Example: Raw HTTP call to public API (/read)

```bash
curl -sS -H "Authorization: Bearer {{DEEPCRAWL_API_KEY}}" \
  "https://api.deepcrawl.dev/read?url=https%3A%2F%2Fexample.com"
```

Note: If your query includes a redacted secret (*****), replace it with {{DEEPCRAWL_API_KEY}}.

7) Verification hooks
Local
•  Build/type/lint
◦  pnpm -w build
◦  pnpm -w typecheck
◦  pnpm -w lint
•  Workers dry-run
◦  pnpm --filter ./apps/workers/v0 wrangler deploy --dry-run
•  Docs app
◦  pnpm --filter ./apps/app dev (preview Fumadocs)
•  Link validation (choose one)
◦  pnpm dlx lychee --config lychee.toml apps/app/content
◦  pnpm dlx linkinator "apps/app/content/**/*.mdx"
•  Snippet verification
◦  Node examples: tsx scripts or vitest unit that imports and runs examples with mocked network.
◦  Workers examples: miniflare test or wrangler dev with mocked bindings.

CI suggestions
•  Jobs: typecheck, lint, build, links, (optional) unit-tests.
•  Fail PR if any snippet or link check fails.
•  Optional: daily job to fetch and snapshot https://api.deepcrawl.dev/openapi for drift detection.

8) Contributor workflow
•  Local preview (Windows-friendly)
◦  pnpm i
◦  pnpm --filter ./apps/app dev
◦  Visit http://localhost:3000 (or your configured port)
•  Branching and labels
◦  Branch naming: docs/feature-xyz or docs/fix-abc
◦  Labels: docs, dx, needs-sme, breaking-change, future, experimental
•  Review gates
◦  Author runs local verification hooks.
◦  At least one maintainer and one SME sign off for Reference or Concepts changes.
•  Versioning
◦  SDK is pre-1.0 (v0.4.4): breaking changes allowed with clear release notes and migration tips.
◦  Keep docs compatible with latest main; pin examples to stable endpoints.
•  Merging
◦  Ensure nav JSON and MDX frontmatter are consistent.
◦  Ensure related links are present and not broken.

9) MDX frontmatter and page template
Use consistent frontmatter to drive nav, badges, and cross-linking.

```mdx
---
title: First Crawl (Node)
description: Install deepcrawl and run your first readUrl in a Node script.
diataxis: tutorial
audience: full-stack, backend
prerequisites:
  - Node >= 18
  - API key configured as DEEPCRAWL_API_KEY
lastReviewed: 2025-10-11
status: ready
tags: [node, markdown, metadata]
related:
  - /get-started/installation
  - /reference/sdk
---

# First Crawl (Node)

{/* Content starts here */}
```

10) Known limitations / TODO (to reflect in docs)
•  CLI not implemented (planned).
•  No project scaffolder (install via pnpm add).
•  No deepcrawl.config.ts schema (constructor/env only).
•  No R2/S3 or Vercel Cron tutorials yet (mark as future).
•  i18n not set up (future).
•  SDK is pre-1.0; APIs may change.
•  Sitemap parsing may be unstable; note this explicitly where mentioned.

11) Cross-linking plan
•  Each tutorial should link to:
◦  Reference: relevant SDK method or endpoint.
◦  Guide: related best practice (e.g., retries, errors).
•  Guides should link to:
◦  Concepts: trade-offs and architecture rationale.
◦  Reference: parameters and error codes.
•  Reference should link to:
◦  Guides for usage patterns.
◦  Concepts for design background.

12) Fumadocs content organization proposal
•  Root: apps/app/content/docs
•  Files
◦  get-started/overview.mdx
◦  get-started/installation.mdx
◦  get-started/first-crawl-node.mdx
◦  get-started/first-crawl-nextjs.mdx
◦  get-started/api-keys-rate-limits.mdx
◦  tutorials/worker-sdk.mdx
◦  tutorials/nextjs-server-actions.mdx
◦  tutorials/ai-agent-plugin.mdx
◦  tutorials/scheduled-tasks-future.mdx
◦  guides/auth.mdx
◦  guides/rate-limit-retry.mdx
◦  guides/reading-parsing.mdx
◦  guides/logs-persistence.mdx
◦  guides/puppeteer.mdx
◦  guides/error-handling.mdx
◦  reference/http-api.mdx
◦  reference/orpc.mdx
◦  reference/sdk.mdx
◦  reference/config-env.mdx
◦  reference/errors.mdx
◦  concepts/architecture.mdx
◦  concepts/data-flow.mdx
◦  concepts/runtime-caching.mdx
◦  concepts/type-safety.mdx
◦  concepts/performance-limits.mdx
◦  integrations/cloudflare-wrangler.mdx
◦  integrations/neon-d1.mdx
◦  integrations/nextjs.mdx
◦  integrations/puppeteer-workers.mdx
◦  integrations/r2-future.mdx
◦  contribute/local-dev.mdx
◦  contribute/docs-authoring.mdx
◦  contribute/style-linting.mdx
◦  contribute/versioning-releases.mdx
◦  contribute/roadmap.mdx

13) Page seeds: critical content bullets
•  Reference/http-api
◦  Document /read, /links, /logs, /openapi, /docs
◦  Auth: Bearer token; include curl examples
◦  Parameters: markdown, metadata, rawHtml, cleanedHtml, robots, sitemapXML (warn unstable)
◦  Response fields: markdown, metadata, links
◦  Error statuses and common failures
•  Reference/sdk
◦  DeepcrawlApp constructor options: apiKey, baseUrl? (if available)
◦  Methods: readUrl, getMarkdown, link extractors
◦  Retry/backoff knobs if exposed
◦  Runtime notes: server-only, no browser
•  Guides/reading-parsing
◦  Choosing output: markdown vs raw/cleaned HTML
◦  Link classification buckets
◦  Canonical URL handling, robots behavior overview

14) Self-check criteria before merge (quick gate)
•  Does the page clearly state audience and outcome?
•  Are examples runnable on Node 18+ or Workers?
•  Are there at least two related links?
•  Are all feature flags and “Future” labels correct?
•  Do build/typecheck/lint/link checks pass?
•  Does the page avoid framework lock-in unless explicitly scoped?

15) Final confirmation step (please answer)
•  Do you want AI agent integration examples for specific frameworks (e.g., LangChain, LlamaIndex), and if so, which ones first? (using ai-sdk from vercel as the example, implement an extream minimal example.)
•  Should SDK code samples prioritize Node scripts or Next.js Server Actions by default? (Prioritize Node scripts while also have nextj.js server actions both)
•  Should “Integrations” remain a top-level section or be moved under “Guides”? (top-level section)