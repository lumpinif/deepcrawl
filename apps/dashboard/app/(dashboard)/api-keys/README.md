# API Keys Management

This page provides comprehensive API key management functionality for DeepCrawl services using Better Auth's API Key plugin.

## Features

- ✅ **Create API Keys**: Generate new API keys with customizable names and expiration dates
- ✅ **View API Keys**: Display all user API keys in a comprehensive table
- ✅ **Edit API Keys**: Update key names and enable/disable status
- ✅ **Delete API Keys**: Remove API keys with confirmation dialog
- ✅ **Security Features**: One-time key display, copy functionality, and proper permissions
- ✅ **Expiration Management**: Support for custom expiration periods or never-expiring keys
- ✅ **Usage Tracking**: Display last used dates and remaining usage counts

## Implementation Structure

### Server Actions (`/app/actions/auth.ts`)
- `fetchApiKeys()`: Retrieve user's API keys
- `createApiKey()`: Create new API key with permissions
- `updateApiKey()`: Update existing API key properties
- `deleteApiKey()`: Remove API key from system

### React Query Hooks (`/hooks/auth.hooks.ts`)
- `useApiKeys()`: Query hook for fetching API keys
- `useCreateApiKey()`: Mutation for creating API keys
- `useUpdateApiKey()`: Mutation for updating API keys with optimistic updates
- `useDeleteApiKey()`: Mutation for deleting API keys with optimistic updates

### Components
- **`api-keys-table.tsx`**: Main table component displaying API keys with actions
- **`create-api-key-dialog.tsx`**: Modal for creating new API keys with success state
- **`edit-api-key-dialog.tsx`**: Modal for editing existing API key properties

## Security Features

1. **One-time Display**: API keys are only shown once after creation
2. **Copy Protection**: Built-in copy functionality with visual feedback
3. **Permission System**: Default permissions for DeepCrawl services (read, links)
4. **Expiration Options**: Configurable expiration periods (30d, 60d, 90d, 6m, 1y, never)

## API Key Permissions Structure

```typescript
permissions: {
  read: ['GET', 'POST', 'PUT', 'DELETE'],
  links: ['GET', 'POST', 'PUT', 'DELETE']
}
```

## Usage Instructions

1. **Creating an API Key**:
   - Click "Create API Key" button
   - Enter a descriptive name (optional)
   - Select expiration period
   - Copy the generated key immediately (won't be shown again)

2. **Managing API Keys**:
   - View all keys in the table with status, expiration, and usage info
   - Use dropdown menu to edit, enable/disable, or delete keys
   - Track last used dates and remaining usage counts

3. **Security Best Practices**:
   - Copy API keys to a secure location immediately after creation
   - Use descriptive names to identify key purposes
   - Set appropriate expiration dates based on usage requirements
   - Regularly review and remove unused keys

## Future Enhancements

- Advanced permission management UI
- Rate limiting configuration
- API key usage analytics
- Batch operations for multiple keys
- Integration with specific DeepCrawl services 