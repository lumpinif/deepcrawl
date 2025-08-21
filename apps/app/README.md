# 📊 DeepCrawl Dashboard

**Modern management interface** for the DeepCrawl service built with Next.js 15 and cutting-edge web technologies.

[![Next.js](https://img.shields.io/badge/Next.js-15-black.svg)](https://nextjs.org/)
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
- 🌍 **Universal SDK Integration** - Built-in DeepCrawl TypeScript SDK

### **Technical Stack**
- ⚡ **Next.js 15** - Latest App Router with React 19
- 📊 **TanStack Query** - Powerful server state management
- 🎨 **shadcn/ui + Tailwind** - Beautiful, accessible component library
- 🛠️ **Turbopack** - Ultra-fast development builds
- 🔄 **React Hook Form** - Performant form handling
- 🎨 **Framer Motion** - Smooth animations and transitions

### **Developer Experience**
- 🔥 **Hot Module Replacement** - Instant feedback during development
- 📋 **TypeScript-First** - Full type safety across the application
- 🧩 **Component Documentation** - Fumadocs integration for component docs
- 🎨 **Design System** - Consistent UI patterns and theming
- 🛠️ **Development Tools** - Built-in debugging and development utilities

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

### **Environment Variables**
```bash
# Authentication
NEXT_PUBLIC_USE_AUTH_WORKER=true
BETTER_AUTH_SECRET=your_secret_key

# Database
DATABASE_URL=your_postgres_url

# DeepCrawl API
DEEPCRAWL_API_URL=https://api.deepcrawl.dev
```

## 🏗️ Architecture

- **App Router** - Next.js 15 app directory structure
- **Server Actions** - Type-safe server-side operations
- **React Suspense** - Efficient loading states and streaming
- **Component Co-location** - Components alongside their usage
- **Shared State** - TanStack Query for global state management
