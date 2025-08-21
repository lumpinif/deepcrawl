# @deepcrawl/eslint-config

**Shared ESLint configuration** for the DeepCrawl monorepo workspace.

## Features

- ✅ **TypeScript-first** - Optimized for TypeScript development
- ✅ **React/Next.js ready** - Includes React and Next.js specific rules
- ✅ **Node.js compatible** - Configurations for server-side code
- ✅ **Accessibility focused** - Built-in a11y rules
- ✅ **Consistent formatting** - Integrates with Biome for unified styling

## Usage

In your `eslint.config.js`:

```javascript
import { base } from '@deepcrawl/eslint-config';

export default [
  ...base,
  // Your custom rules here
];
```

### Available Configurations

- **`base`** - Core ESLint rules for TypeScript
- **`next`** - Next.js specific configuration 
- **`react-internal`** - Internal React component rules

## Installation

This package is automatically included in the workspace. No manual installation required.