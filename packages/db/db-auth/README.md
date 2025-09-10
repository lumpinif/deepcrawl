# @deepcrawl/db-auth

**Authentication database** package for Deepcrawl using PostgreSQL and Drizzle ORM.

## Features

- ✅ **PostgreSQL Database** - Robust relational database for user management
- ✅ **Drizzle ORM** - Type-safe database operations and migrations
- ✅ **Better Auth Integration** - User, session, and account management
- ✅ **Migration System** - Version-controlled database schema changes
- ✅ **Development Tools** - Drizzle Studio for database visualization

## Database Schema

### **Core Tables**
- `users` - User account information
- `sessions` - Active user sessions
- `accounts` - OAuth provider accounts
- `verification_tokens` - Email verification and password reset tokens

### **Features**
- **Multi-session support** - Users can have multiple active sessions
- **OAuth integration** - Support for GitHub, Google, and other providers
- **Email verification** - Secure account verification workflow
- **Password reset** - Secure password recovery system

## Development Commands

```bash
# Navigate to the package directory
cd packages/db/db-auth

# Generate database migrations
pnpm db:generate

# Push database schema changes (development)
pnpm db:push

# Run Drizzle Studio (database GUI)
pnpm db:studio

# Run database migrations
pnpm db:migrate

# Full database sync (generate + migrate)
pnpm db:sync
```

## Production Commands

```bash
# Production database operations
pnpm db:generate:prod
pnpm db:push:prod
pnpm db:sync:prod
```

## Configuration

The database is configured to work with:

- **Neon PostgreSQL** - Production database hosting
- **Better Auth** - Authentication framework
- **Environment Variables** - `DATABASE_URL` for connection
- **SSL Configuration** - Secure connections in production

## Usage

```typescript
import { db } from '@deepcrawl/db-auth';
import { users, sessions } from '@deepcrawl/db-auth/schema';

// Query users
const allUsers = await db.select().from(users);

// Insert new user
const newUser = await db.insert(users).values({
  email: 'user@example.com',
  name: 'John Doe',
}).returning();
```

## Schema Structure

The database schema is designed to support Better Auth's requirements:

- **User Management** - Core user data and preferences
- **Session Handling** - Multiple concurrent sessions per user
- **OAuth Accounts** - Linked social media accounts
- **Security Tokens** - Verification and reset tokens
- **Audit Trail** - Created/updated timestamps

## Development Workflow

1. **Make Schema Changes** - Edit `src/db/schema.ts`
2. **Generate Migration** - Run `pnpm db:generate`
3. **Review Migration** - Check generated SQL in `drizzle/` folder
4. **Apply Changes** - Run `pnpm db:push` or `pnpm db:migrate`
5. **Test Changes** - Use `pnpm db:studio` to verify schema