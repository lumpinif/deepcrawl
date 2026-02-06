# 📊 Deepcrawl Dashboard

Management interface for the Deepcrawl service built with Next.js 16 and modern web technologies.

[![Next.js](https://img.shields.io/badge/Next.js-16-black.svg)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19-blue.svg)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-Ready-blue.svg)](https://www.typescriptlang.org)
[![Tailwind](https://img.shields.io/badge/Tailwind-CSS-38bdf8.svg)](https://tailwindcss.com/)

## 🚀 Development

```bash
# Start development server with Turbopack
pnpm dev

# Start with all workers (dashboard + auth + deepcrawl)
pnpm dev:workers

# Start with auth worker only
pnpm dev:auth-worker

# Clean build artifacts
pnpm clean
pnpm clean:node  # Custom script to clean node_modules

# Run all checks (lint, format, typecheck)
pnpm check
```

## ⚡ Features

### **Core Functionality**
- 🔐 **Multi-Provider Authentication** - GitHub, Google, passkeys, magic links
- 🔑 **API Key Management** - Generate, manage, and monitor API keys
- 📊 **Usage Analytics** - Real-time monitoring and analytics dashboard
- 👥 **Multi-Session Support** - Manage multiple accounts simultaneously
- 🌍 **Universal SDK Integration** - Built-in Deepcrawl TypeScript SDK

### **Technical Stack**
- ⚡ **Next.js 16** - App Router with React 19
- 📊 **TanStack Query** - Server state management
- 🎨 **shadcn/ui + Tailwind** - Component library
- 🛠️ **Turbopack** - Development builds
- 🔄 **React Hook Form** - Form handling
- 🎨 **Framer Motion** - Animations and transitions

### **Developer Experience**
- 🔥 **Hot Module Replacement** - Fast feedback during development
- 📋 **TypeScript-First** - Full type safety across the application
- 🧩 **Component Documentation** - Fumadocs integration for component docs
- 🎨 **Design System** - Consistent UI patterns and theming
- 🛠️ **Development Tools** - Debugging and development utilities

## 🎨 UI Development

```bash
# Add shadcn/ui components
pnpm ui add button

# Available component categories:
# - Layout: card, sheet, dialog, drawer
# - Form: input, button, select, checkbox
# - Navigation: tabs, breadcrumb, sidebar
# - Data: table, chart, avatar, badge
# - Feedback: alert, toast, skeleton
```

### **Component Usage**
```tsx
// Import from shared UI package
import { Button } from "@deepcrawl/ui/components/ui/button";
import { Card } from "@deepcrawl/ui/components/ui/card";

// Theme integration
import { useTheme } from "next-themes";
```

## 🔧 Configuration

Internal reference:

- See `AUTH_MODES_AND_WORKERS.md` for the full auth matrix (AUTH_MODE x auth backend).

### **Environment Variables**
```bash
# Authentication
AUTH_MODE=better-auth | jwt | none
# only effective if you set AUTH_MODE to jwt
AUTH_JWT_TOKEN=your_jwt_token 
NEXT_PUBLIC_USE_AUTH_WORKER=true
BETTER_AUTH_SECRET=your_secret_key

# Database
DATABASE_URL=your_postgres_url

# Deepcrawl API
DEEPCRAWL_API_URL=https://api.deepcrawl.dev
```

## 🏗️ Architecture

- **App Router** - Next.js 16 app directory structure
- **Server Actions** - Type-safe server-side operations
- **React Suspense** - Efficient loading states and streaming
- **Component Co-location** - Components alongside their usage
- **Shared State** - TanStack Query for global state management
