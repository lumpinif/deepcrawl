# @deepcrawl/contracts

**API contract definitions** for oRPC endpoints in the Deepcrawl ecosystem.

## Features

- ✅ **oRPC Contracts** - Type-safe API contract definitions
- ✅ **Shared Interfaces** - Consistent contracts between client and server
- ✅ **Error Definitions** - Standardized error types and responses
- ✅ **Input/Output Schemas** - Request and response validation schemas
- ✅ **Universal Types** - Works across all Deepcrawl services

## Package Structure

```
src/
├── read.ts      # Read service contract definitions
├── links.ts     # Links service contract definitions  
├── errors.ts    # Shared error definitions
└── index.ts     # Main exports
```

## Usage

### Import Contracts

```typescript
import { 
  readContract,
  linksContract 
} from '@deepcrawl/contracts';
```

### Server Implementation

```typescript
import { createORPC } from '@orpc/server';
import { readContract, linksContract } from '@deepcrawl/contracts';

const orpc = createORPC()
  .contract(readContract)
  .contract(linksContract)
  // Implementation...
```

### Client Usage

```typescript
import { createClient } from '@orpc/client';
import { readContract } from '@deepcrawl/contracts';

const client = createClient({
  contract: readContract,
  // Configuration...
});
```

## Contract Definitions

### **Read Contract**
- Input validation for URL reading requests
- Output schemas for processed content
- Error definitions for read operations

### **Links Contract**  
- Input validation for link extraction requests
- Output schemas for link analysis results
- Error definitions for link operations

### **Error Contracts**
- Standardized error codes and messages
- Type-safe error handling
- Consistent error responses across services

## Development

This package is automatically built as part of the monorepo workspace. No separate build process required.