# 🔐 Deepcrawl Auth Worker

Authentication service powered by Better Auth and Cloudflare Workers.

[![Better Auth](https://img.shields.io/badge/Better_Auth-1.3-green.svg)](https://better-auth.com/)
[![Cloudflare Workers](https://img.shields.io/badge/Cloudflare-Workers-orange.svg)](https://workers.cloudflare.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-Ready-blue.svg)](https://www.typescriptlang.org)

## 🚀 Development

Before running Wrangler locally, sync env files from the repo root:

```bash
pnpm env:sync:local
```

This generates:

- `.dev.vars` (secrets only)
- `wrangler.jsonc` is the single source for non-secrets via Wrangler `vars`.

```bash
# Start development server
pnpm dev

# Run all checks (lint, format, typecheck)
pnpm check

# Generate auth schema
pnpm auth:generate
```

## 🚀 Deployment

```bash
# Deploy to production
pnpm deploy

# Preview deployment
pnpm preview
```

## ⚡ Features

### **Authentication Methods**
- 🔐 **OAuth Providers** - GitHub, Google integration
- 🔑 **Passkeys** - WebAuthn passwordless authentication
- ✨ **Magic Links** - Email-based login
- 📧 **Email Verification** - Account verification flow
- 🔄 **Password Reset** - Password recovery

### **Session Management**
- 🏢 **Multi-Session Support** - Up to 2 concurrent sessions per user
- 🍪 **Cross-Domain Cookies** - Works across `deepcrawl.dev` subdomains
- 🔐 **API Key Authentication** - Primary method for API access
- 🍪 **Cookie Fallback** - Dashboard authentication
- 🛡️ **Secure Headers** - CSRF protection and security headers

### **Email System**
- 📨 **Universal Email Support** - Works in both Workers and Next.js
- 🎨 **HTML Templates** - Email designs
- 📧 **Resend Integration** - Email delivery
- 👥 **Organization Invitations** - Team invitation system

### **Additional Features**
- 🔗 **Service Bindings** - Communication with main Deepcrawl worker
- 🌍 **Environment Aware** - Development and production configurations
- 📊 **Rate Limiting** - Protection against abuse

## 🔧 Configuration

### **Required Environment Variables**
```bash
# Core authentication
BETTER_AUTH_URL=http://localhost:8787
BETTER_AUTH_SECRET=your_secret_key
DATABASE_URL=your_postgres_url

# OAuth providers (optional)
GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

# Email service (optional)
RESEND_API_KEY=re_your_resend_api_key
FROM_EMAIL="Deepcrawl <noreply@deepcrawl.dev>"
```

## 🏗️ Architecture

Built on Better Auth with:
- **Database Integration** - PostgreSQL with Drizzle ORM
- **Email Templates** - React components with universal rendering
- **Service Communication** - Bindings to main Deepcrawl worker
- **Multi-Environment** - Development and production configurations
