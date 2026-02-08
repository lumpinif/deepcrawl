# Authentication Modes and Auth Backends (Internal)

This document is an internal engineering reference. Customer-facing docs should
live in Fumadocs.

## Glossary

- **Dashboard**: `apps/app` (Next.js)
- **API Worker (v0)**: `apps/workers/v0` (Cloudflare Worker)
- **Auth Worker**: `apps/workers/auth` (Cloudflare Worker running Better Auth)
- **Next.js Integrated Better Auth**: `apps/app/app/api/auth/[...all]/route.ts`

## Two Axes

### 1) `AUTH_MODE` (3 modes)

`AUTH_MODE` controls how the **API Worker (v0)** authenticates requests.

In practice, treat `AUTH_MODE` as a system-wide mode and configure the same
value for:

- Dashboard environment (`apps/app/.env*`)
- v0 worker environment (`apps/workers/v0/.dev.vars`, `apps/workers/v0/wrangler.jsonc`)

Modes:

- `better-auth`
  - v0: API key + cookie-session authentication via Better Auth.
  - Dashboard: app routes and `/api/deepcrawl/*` are session-protected.
- `jwt`
  - v0: verifies `Authorization: Bearer <jwt>`.
  - Dashboard: no Better Auth session required; the Dashboard server can attach
    a JWT when calling v0 using `AUTH_JWT_TOKEN`.
- `none`
  - v0: no auth checks (open access).
  - Dashboard: no Better Auth session required.

### 2) Better Auth Backend (2 options)

Only meaningful when `AUTH_MODE=better-auth`. It answers: "Where does Better Auth run?"

- Cloudflare Auth Worker (`apps/workers/auth`)
- Next.js integrated Better Auth (`apps/app/app/api/auth/[...all]/route.ts`)

The Dashboard switch is `NEXT_PUBLIC_USE_AUTH_WORKER`:

- `true` (default): Dashboard uses the Cloudflare Auth Worker as the Better Auth backend.
- `false`: Dashboard uses the Next.js integrated Better Auth backend.

The v0 worker does not read `NEXT_PUBLIC_USE_AUTH_WORKER`. v0 only needs
`BETTER_AUTH_URL` to reach the Better Auth backend over HTTP, and will use RPC
only when an `AUTH_WORKER` service binding is present.

## `BETTER_AUTH_URL` Recommendation

Prefer an origin-level `BETTER_AUTH_URL` (no `/api/auth`):

- `http://localhost:8787` (Cloudflare Auth Worker dev)
- `http://localhost:3000` (Next.js integrated dev)
- `https://auth.deepcrawl.dev` (Cloudflare Auth Worker prod)
- `https://deepcrawl.dev` (Next.js integrated prod)

Notes:

- v0 also accepts a `BETTER_AUTH_URL` that already includes `/api/auth` and will
  de-duplicate it internally.
- Keep docs and templates origin-level to reduce confusion.

## Compatibility Matrix (6 Combinations)

Legend:

- ✅ supported and meaningful
- ⚠️ supported, but the Better Auth backend choice is effectively irrelevant

| `AUTH_MODE` | Better Auth backend | Supported? | What actually happens |
| --- | --- | --- | --- |
| `better-auth` | Cloudflare Auth Worker | ✅ | Dashboard authenticates via Auth Worker; v0 authenticates via RPC fast path (API key) when available, otherwise HTTP to Better Auth. |
| `better-auth` | Next.js integrated | ✅ | Dashboard authenticates via Next.js; v0 authenticates via HTTP calls to Next.js Better Auth `/api/auth/get-session`. |
| `jwt` | Cloudflare Auth Worker | ⚠️ | v0 uses JWT. Better Auth backend choice does not affect v0 auth. |
| `jwt` | Next.js integrated | ⚠️ | Same as above. |
| `none` | Cloudflare Auth Worker | ⚠️ | v0 is open. Better Auth backend choice does not affect v0 auth. |
| `none` | Next.js integrated | ⚠️ | Same as above. |

## Real-World Scenarios

### A) `better-auth` + Cloudflare Auth Worker

**What you get**

- Dashboard: Better Auth login, multi-session, API key management.
- v0: API key + cookie-session auth.
- v0 can use `AUTH_WORKER.getSessionWithAPIKey()` (RPC + KV cache) when the
  service binding exists.

Operational note:

- Better Auth sessions are cookie-based. Cookie auth only works when the
  Dashboard and API can share a session cookie (same apex domain).
- If you deploy the Dashboard on `*.vercel.app` and the Auth Worker on
  `*.workers.dev`, the browser cannot share cookies across those root domains,
  so cookie-based API calls will not work.
- Recommended: use a custom domain and put both services under the same apex
  domain (for example `app.example.com`, `api.example.com`, `auth.example.com`).
- For free-domain deployments (different apex domains), the Dashboard can use a
  system-managed API key as a cross-domain escape hatch:
  - The Dashboard will auto-create an API key named `PLAYGROUND_API_KEY` and
    store the plaintext key in `localStorage` on that device.
  - The Dashboard uses it as a fallback for API calls when cookie auth fails
    (cookie session -> JWT -> `PLAYGROUND_API_KEY`).
  - Rotate the key if it is ever leaked.
- Optional: set `NEXT_PUBLIC_USE_AUTH_WORKER=false` to use the Next.js
  integrated Better Auth routes (same origin as the Dashboard).

**How operators configure it (local dev)**

- Dashboard (`apps/app/.env`):

```env
AUTH_MODE=better-auth
NEXT_PUBLIC_USE_AUTH_WORKER=true
NEXT_PUBLIC_APP_URL=http://localhost:3000
BETTER_AUTH_URL=http://localhost:8787
BETTER_AUTH_SECRET=...
DATABASE_URL=...
```

- Auth Worker (`apps/workers/auth/.dev.vars`): configure Better Auth + DB.
- v0 Worker (`apps/workers/v0/.dev.vars`):

```env
AUTH_MODE=better-auth
BETTER_AUTH_URL=http://localhost:8787
```

**How end users use it**

- Dashboard user:
  - Open the Dashboard and sign in.
  - If needed (cross-domain), the Dashboard auto-creates `PLAYGROUND_API_KEY`
    on first load and stores it on the device.
  - Create additional API keys in the UI for server-side integrations.
- API caller:
  - Call v0 with `x-api-key: <apiKey>` (or `Authorization: Bearer <apiKey>`).

### B) `better-auth` + Next.js integrated Better Auth (no Cloudflare Auth Worker)

**What you get**

- Dashboard: Better Auth login and API key management (same UX).
- v0: API key + cookie-session auth.
- v0 validates API keys by calling Next.js Better Auth:
  - `GET {BETTER_AUTH_URL}/api/auth/get-session` with `x-api-key`.

**How operators configure it (local dev)**

- Dashboard (`apps/app/.env`):

```env
AUTH_MODE=better-auth
NEXT_PUBLIC_USE_AUTH_WORKER=false
NEXT_PUBLIC_APP_URL=http://localhost:3000
BETTER_AUTH_URL=http://localhost:3000
BETTER_AUTH_SECRET=...
DATABASE_URL=...
```

- v0 Worker (`apps/workers/v0/.dev.vars`):

```env
AUTH_MODE=better-auth
BETTER_AUTH_URL=http://localhost:3000
```

**How end users use it**

- Dashboard user:
  - Open the Dashboard and sign in.
  - Create an API key in the UI.
- API caller:
  - Call v0 with `x-api-key: <apiKey>` (or `Authorization: Bearer <apiKey>`).

Operational note:

- In production, v0 must be able to reach your Next.js domain over HTTP(S).

### C) `jwt` (Better Auth backend is irrelevant)

**What you get**

- v0 verifies `Authorization: Bearer <jwt>`.
- Dashboard server can attach a JWT using `AUTH_JWT_TOKEN`.

**How operators configure it**

- v0 Worker secrets (`apps/workers/v0/.dev.vars`):

```env
JWT_SECRET=...
```

- v0 Worker vars (`apps/workers/v0/wrangler.jsonc` `"vars"`):

```env
AUTH_MODE=jwt
JWT_ISSUER=...     # optional
JWT_AUDIENCE=...   # optional
```

- Dashboard (`apps/app/.env`):

```env
AUTH_MODE=jwt
AUTH_JWT_TOKEN=...
```

**How end users use it**

- API caller:
  - Call v0 with `Authorization: Bearer <jwt>`.

### D) `none` (Better Auth backend is irrelevant)

**What you get**

- v0 is open (no auth).

**How operators configure it**

- v0 Worker:

```env
AUTH_MODE=none
```

**How end users use it**

- API caller:
  - Call v0 without auth headers.

## Code Pointers

- Dashboard mode helpers: `apps/app/lib/auth-mode.ts`
- Dashboard Better Auth client base URL selection: `apps/app/lib/auth.client.ts`
- Dashboard route protection middleware: `apps/app/proxy.ts`
- v0 auth middlewares:
  - `apps/workers/v0/src/middlewares/jwt-auth.hono.ts`
  - `apps/workers/v0/src/middlewares/api-key-auth.hono.ts`
  - `apps/workers/v0/src/middlewares/cookie-auth.hono.ts`
- v0 service-binding fetcher (optional): `apps/workers/v0/src/middlewares/service-fetchers.hono.ts`
