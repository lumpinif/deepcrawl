# Deepcrawl D1 Database Schema

This document describes the D1 database schema for storing API activity logs and analytics data.

## Overview

The database uses a **schema-mirrored design** that exactly mirrors the Zod schemas from `@deepcrawl/types`, ensuring perfect consistency between API responses and database structure.

## Tables

### `read_response`

Stores activity logs for both `/read` endpoint methods (`getMarkdown` and `readUrl`). Handles both successful responses and errors in a unified table.

**Schema Alignment**: Mirrors `ReadSuccessResponseSchema` and `ReadErrorResponseSchema`

#### Complete Field List:

**Metadata & Identification:**
- `id`: Primary key (text)
- `userId`: User identifier (text, nullable)
- `method`: `'getMarkdown'` or `'readUrl'` (text, required)

**Common Fields:**
- `success`: Boolean indicating success/failure (integer with boolean mode, required)
- `targetUrl`: The target URL being processed (text, required)
- `requestUrl`: The actual request URL used (text, required)
- `requestOptions`: JSON field mirroring `ReadOptionsSchema` (text with JSON mode)

**Success Response Fields (null for errors):**
- `cached`: Whether response was cached (integer with boolean mode)
- `timestamp`: Response timestamp (text)
- `title`: Page title (text)
- `description`: Page description (text)
- `markdown`: Plain string for getMarkdown, structured data for readUrl (text)
- `rawHtml`: Original HTML content (text)
- `cleanedHtml`: Cleaned HTML content (text)
- `metadata`: JSON field mirroring `PageMetadataSchema` (text with JSON mode)
- `metaFiles`: JSON field mirroring `MetaFilesSchema` (text with JSON mode)
- `metrics`: JSON field mirroring `MetricsSchema` (text with JSON mode)

**Error Response Fields (null for success):**
- `error`: Error message from BaseErrorResponseSchema (text)

**Performance & Timestamps:**
- `executionTimeMs`: Execution time in milliseconds (integer)
- `createdAt`: Record creation timestamp (text, auto-generated)
- `updatedAt`: Record update timestamp (text, auto-generated)

#### Usage Examples:
```sql
-- User activity timeline
SELECT method, success, target_url, created_at 
FROM read_response 
WHERE user_id = ? 
ORDER BY created_at DESC;

-- Success rate by method
SELECT method, 
       COUNT(*) as total_calls,
       SUM(CASE WHEN success = 1 THEN 1 ELSE 0 END) as successful_calls,
       AVG(CASE WHEN success = 1 THEN execution_time_ms END) as avg_execution_time
FROM read_response 
WHERE user_id = ? AND created_at > ?
GROUP BY method;
```

### `links_response`

Stores activity logs for both `/links` endpoint methods (`getLinks` and `extractLinks`). Handles both successful responses and errors in a unified table.

**Schema Alignment**: Mirrors `LinksSuccessResponseSchema` and `LinksErrorResponseSchema`

#### Complete Field List:

**Metadata & Identification:**
- `id`: Primary key (text)
- `userId`: User identifier (text, nullable)
- `method`: `'getLinks'` or `'extractLinks'` (text, required)

**Common Fields:**
- `success`: Boolean indicating success/failure (integer with boolean mode, required)
- `targetUrl`: The target URL being processed (text, required)
- `timestamp`: Response timestamp (text, required for links endpoints)
- `requestUrl`: The actual request URL used (text, required)
- `requestOptions`: JSON field mirroring `LinksOptionsSchema` (text with JSON mode)

**Success Response Fields (null for errors):**
- `cached`: Whether response was cached (integer with boolean mode)
- `title`: Page title (text)
- `description`: Page description (text)
- `cleanedHtml`: Cleaned HTML content (text)
- `metadata`: JSON field mirroring `PageMetadataSchema` (text with JSON mode)
- `metaFiles`: JSON field mirroring `MetaFilesSchema` (text with JSON mode)
- `ancestors`: JSON array of parent URLs (text with JSON mode)
- `skippedUrls`: JSON field mirroring `SkippedLinksSchema` (text with JSON mode)
- `extractedLinks`: JSON field mirroring `ExtractedLinksSchema` (text with JSON mode)
- `tree`: JSON field mirroring `LinksTreeSchema` - can be partial on error (text with JSON mode)

**Error Response Fields (null for success):**
- `error`: Error message from BaseErrorResponseSchema (text)

**Performance & Timestamps:**
- `executionTimeMs`: Execution time in milliseconds (integer)
- `totalUrls`: Total URLs extracted from tree for quick access (integer)
- `createdAt`: Record creation timestamp (text, auto-generated)
- `updatedAt`: Record update timestamp (text, auto-generated)

#### Usage Examples:
```sql
-- Sites with most extracted links
SELECT target_url, total_urls, execution_time_ms
FROM links_response 
WHERE success = 1 AND total_urls > 100
ORDER BY total_urls DESC;

-- Performance analysis by tree size
SELECT 
  CASE 
    WHEN total_urls <= 10 THEN 'Small (1-10)'
    WHEN total_urls <= 50 THEN 'Medium (11-50)'
    ELSE 'Large (50+)'
  END as tree_size,
  AVG(execution_time_ms) as avg_execution_time,
  COUNT(*) as count
FROM links_response 
WHERE success = 1 AND total_urls IS NOT NULL
GROUP BY tree_size;
```

## Performance Indexes

Optimized indexes are defined directly in the schema for common analytics queries:

### `read_response` Indexes:
- `idx_read_response_user_created`: `(user_id, created_at)` - Dashboard timeline queries
- `idx_read_response_success`: `(success)` - Success rate analytics  
- `idx_read_response_method`: `(method)` - Method-specific analytics
- `idx_read_response_target_url`: `(target_url)` - URL pattern analysis
- `idx_read_response_execution_time`: `(execution_time_ms)` - Performance monitoring (conditional)
- `idx_read_response_user_success_method`: `(user_id, success, method)` - User success rate analysis
- `idx_read_response_timestamp`: `(timestamp)` - Timestamp-based analytics (conditional)

### `links_response` Indexes:
- `idx_links_response_user_created`: `(user_id, created_at)` - Dashboard timeline queries
- `idx_links_response_success`: `(success)` - Success rate analytics
- `idx_links_response_method`: `(method)` - Method-specific analytics  
- `idx_links_response_target_url`: `(target_url)` - URL pattern analysis
- `idx_links_response_execution_time`: `(execution_time_ms)` - Performance monitoring (conditional)
- `idx_links_response_total_urls`: `(total_urls)` - Tree size analytics (conditional)
- `idx_links_response_user_success_method`: `(user_id, success, method)` - User success rate analysis
- `idx_links_response_timestamp`: `(timestamp)` - Timestamp-based analytics

## JSON Data Storage

### Why `text` with `{ mode: 'json' }` instead of native JSON?

This schema uses `text('column_name', { mode: 'json' })` for JSON data rather than a native JSON data type because:

1. **SQLite Compatibility**: SQLite does not have a native JSON data type. All JSON data is stored as TEXT internally, regardless of column declaration.

2. **JSON1 Extension Support**: SQLite's JSON functions (json_extract, json_set, etc.) work on TEXT columns containing valid JSON, not on binary blob storage.

3. **Drizzle ORM Benefits**: The `{ mode: 'json' }` option provides:
   - Automatic serialization (JavaScript objects → JSON strings on insert)
   - Automatic deserialization (JSON strings → JavaScript objects on select)
   - TypeScript type safety when combined with `.$type<T>()`

4. **Performance**: TEXT storage with JSON mode allows:
   - Use of SQLite's built-in JSON functions for querying
   - Functional indexes on JSON paths
   - Better query optimization for JSON operations

**Example:**
```typescript
// Schema definition
metadata: text('metadata', { mode: 'json' }).$type<PageMetadata>()

// Drizzle automatically handles:
await db.insert(readResponse).values({
  metadata: { title: "Page Title", lang: "en" } // Object → JSON string
});

const result = await db.select().from(readResponse);
// result[0].metadata is already a parsed JavaScript object
```

This approach follows Drizzle's official recommendation for JSON storage in SQLite and provides the best balance of functionality, performance, and type safety.

## Type Safety

The database schema leverages existing Zod schemas for validation:

```typescript
import { 
  ReadOptionsSchema, 
  ReadSuccessResponseSchema,
  LinksOptionsSchema,
  LinksSuccessResponseSchema 
} from '@deepcrawl/types';
import { readResponse, linksResponse } from '@deepcrawl/db-d1';

// Validate before inserting
const requestOptions = ReadOptionsSchema.parse(input);
const responseData = ReadSuccessResponseSchema.parse(response);

await db.insert(readResponse).values({
  requestOptions: JSON.stringify(requestOptions),
  // ... other fields mapped from responseData
});
```

## Migration Notes

This schema replaces the previous arbitrary tables:
- ❌ `scraped_data` (removed)
- ❌ `extracted_links` (removed)
- ✅ `read_response` (new, schema-aligned)
- ✅ `links_response` (new, schema-aligned)

## Benefits

1. **Schema Consistency**: Database columns exactly match API response fields
2. **Type Safety**: Drizzle types align perfectly with existing Zod types
3. **Analytics Ready**: Unified tables enable complex analytics queries
4. **Future Proof**: Schema evolution matches API evolution automatically
5. **Performance Optimized**: Indexes designed for dashboard and analytics use cases