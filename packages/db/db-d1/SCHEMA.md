# Deepcrawl D1 Database Schema

This document describes the D1 database schema for storing API activity logs and response data with content deduplication.

## Overview

The database uses a **two-table architecture** that separates activity logging from response storage:

1. **`activity_log`**: Tracks all API requests with metadata, performance metrics, and references to response data
2. **`response_record`**: Stores deduplicated response content indexed by hash for efficient storage and retrieval

This design optimizes for:
- Fast activity queries and analytics
- Efficient storage through response deduplication
- Flexible response metadata handling
- Performance tracking across all endpoints

## Tables

### `activity_log`

Unified activity log tracking all API requests across endpoints. This lightweight table enables fast activity tracking and analytics without storing large response payloads.

#### Complete Field List:

**Primary Identification:**
- `id`: Primary key (text)
- `userId`: User identifier (text, nullable)

**Request Metadata:**
- `path`: Endpoint path identifier (text, required)
  - Format: `{endpoint}-{method}` (e.g., `'read-getMarkdown'`, `'links-extractLinks'`)
- `success`: Boolean indicating success/failure (integer with boolean mode, required)
- `cached`: Whether response was cached (integer with boolean mode, nullable)
- `requestTimestamp`: Request timestamp (text, required)

**URL and Options:**
- `requestUrl`: Original URL before normalization (text, required)
- `requestOptions`: Full options JSON for reference (text with JSON mode, nullable)

**Performance Metrics:**
- `executionTimeMs`: Execution time in fractional milliseconds (real, nullable)

**Response References:**
- `responseHash`: Foreign key to `response_record.responseHash` (text, nullable)
  - References the full response content
  - `onDelete: 'set null'`, `onUpdate: 'cascade'`
- `responseMetadata`: Response metadata or full error response if success is false (text with JSON mode, nullable)
  - For successful requests: Contains metrics or other lightweight metadata
  - For failed requests: Contains full error response object

**Error Handling:**
- `error`: Error information (text with JSON mode, nullable)
  - NULL if `success = true`

**Timestamps:**
- `createdAt`: Record creation timestamp (text, auto-generated)

#### Usage Examples:

```sql
-- User activity timeline
SELECT path, success, request_url, request_timestamp, execution_time_ms
FROM activity_log
WHERE user_id = ?
ORDER BY request_timestamp DESC
LIMIT 50;

-- Success rate by endpoint
SELECT path,
       COUNT(*) as total_calls,
       SUM(CASE WHEN success = 1 THEN 1 ELSE 0 END) as successful_calls,
       ROUND(AVG(CASE WHEN success = 1 THEN execution_time_ms END), 2) as avg_execution_time_ms
FROM activity_log
WHERE user_id = ? AND request_timestamp > ?
GROUP BY path
ORDER BY total_calls DESC;

-- Performance distribution analysis
SELECT
  CASE
    WHEN execution_time_ms <= 100 THEN 'Fast (<100ms)'
    WHEN execution_time_ms <= 500 THEN 'Medium (100-500ms)'
    WHEN execution_time_ms <= 1000 THEN 'Slow (500-1000ms)'
    ELSE 'Very Slow (>1000ms)'
  END as performance_bucket,
  COUNT(*) as count,
  ROUND(AVG(execution_time_ms), 2) as avg_ms
FROM activity_log
WHERE success = 1 AND execution_time_ms IS NOT NULL
GROUP BY performance_bucket
ORDER BY avg_ms;

-- Cache hit rate analysis
SELECT
  path,
  COUNT(*) as total_requests,
  SUM(CASE WHEN cached = 1 THEN 1 ELSE 0 END) as cache_hits,
  ROUND(100.0 * SUM(CASE WHEN cached = 1 THEN 1 ELSE 0 END) / COUNT(*), 2) as cache_hit_rate
FROM activity_log
WHERE success = 1
GROUP BY path;

-- Error analysis
SELECT
  path,
  COUNT(*) as error_count,
  json_extract(error, '$.message') as error_message
FROM activity_log
WHERE success = 0 AND error IS NOT NULL
GROUP BY path, error_message
ORDER BY error_count DESC;
```

### `response_record`

Stores deduplicated response content indexed by hash. This table contains the actual response payloads that are referenced by `activity_log` entries.

#### Complete Field List:

**Primary Key:**
- `responseHash`: Primary key - content hash for deduplication (text)

**Request Identification:**
- `path`: Endpoint path identifier (text, required)
  - Format: `{endpoint}-{method}` (e.g., `'read-getMarkdown'`, `'links-extractLinks'`)
- `optionsHash`: Hash of request options for cache lookup (text, required)
- `updatedBy`: User identifier who last updated this record (text, nullable)

**Response Content:**
- `responseContent`: Full response payload (text with JSON mode, nullable)
  - Contains the complete API response object
  - Stored as JSON for flexible querying

**Content Management:**
- `responseSize`: Size of response content in bytes (integer, nullable)
  - Useful for storage analytics and optimization

**Timestamps:**
- `createdAt`: Record creation timestamp (text, auto-generated)
- `updatedAt`: Record update timestamp (text, auto-generated)

#### Usage Examples:

```sql
-- Get full response content for an activity log entry
SELECT ar.response_content
FROM activity_log al
JOIN response_record ar ON al.response_hash = ar.response_hash
WHERE al.id = ?;

-- Storage usage analysis by endpoint
SELECT
  path,
  COUNT(*) as unique_responses,
  SUM(response_size) as total_bytes,
  ROUND(AVG(response_size), 2) as avg_response_size
FROM response_record
WHERE response_size IS NOT NULL
GROUP BY path
ORDER BY total_bytes DESC;

-- Find recently updated responses
SELECT
  response_hash,
  path,
  updated_by,
  updated_at,
  response_size
FROM response_record
ORDER BY updated_at DESC
LIMIT 20;

-- Deduplication effectiveness
SELECT
  path,
  COUNT(DISTINCT options_hash) as unique_request_combinations,
  COUNT(*) as unique_responses,
  ROUND(100.0 * COUNT(*) / COUNT(DISTINCT options_hash), 2) as dedup_ratio
FROM response_record
GROUP BY path;
```

## Performance Indexes

Optimized indexes are defined directly in the schema for common analytics and lookup queries:

### `activity_log` Indexes:

- `idx_activity_user_timestamp`: `(user_id, request_timestamp)` - Dashboard timeline queries
- `idx_activity_path_success`: `(path, success)` - Endpoint-specific success analytics
- `idx_activity_execution_time`: `(execution_time_ms)` - Performance monitoring (conditional, only non-null)
- `idx_activity_request_url`: `(request_url)` - URL-based lookups
- `idx_activity_user_success`: `(user_id, success, path)` - User success rate analysis
- `idx_activity_request_options`: `(request_options)` - Options-based queries

### `response_record` Indexes:

- `idx_response_record_response_hash`: `(response_hash)` - Primary lookup by hash
- `idx_response_record_updated_by`: `(updated_by)` - User-based queries
- `idx_response_record_options`: `(options_hash)` - Cache lookup by options
- `idx_response_record_path`: `(path)` - Endpoint-specific queries
- `idx_response_record_updated_at`: `(updated_at)` - Time-based analytics
- `idx_response_record_created_at`: `(created_at)` - Creation time queries

## Architecture Benefits

### Deduplication Strategy

The two-table design provides efficient content deduplication:

1. **Activity Tracking**: Every API request creates an `activity_log` entry
2. **Response Storage**: Unique responses are stored once in `response_record` by hash
3. **Reference Linking**: Activity logs reference responses via `responseHash`
4. **Storage Efficiency**: Identical responses (same content) are stored only once

### Query Performance

- **Fast Activity Queries**: Lightweight `activity_log` table enables quick timeline and analytics queries
- **Efficient Joins**: Only fetch full response content when needed via JOIN
- **Optimized Indexes**: Separate indexes for activity patterns and response lookup

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
requestOptions: text('request_options', { mode: 'json' })

// Drizzle automatically handles:
await db.insert(activityLog).values({
  requestOptions: { maxDepth: 2, includeMetadata: true } // Object → JSON string
});

const result = await db.select().from(activityLog);
// result[0].requestOptions is already a parsed JavaScript object
```

This approach follows Drizzle's official recommendation for JSON storage in SQLite and provides the best balance of functionality, performance, and type safety.

## Type Safety

The database schema provides TypeScript type safety through Drizzle ORM:

```typescript
import { activityLog, responseRecord } from '@deepcrawl/db-d1';
import type { ActivityLog, NewActivityLog, ResponseRecord, NewResponseRecord } from '@deepcrawl/db-d1';

// Type-safe inserts
const newActivity: NewActivityLog = {
  id: 'unique-id',
  userId: 'user-123',
  path: 'read-getMarkdown',
  success: true,
  cached: false,
  requestTimestamp: new Date().toISOString(),
  requestUrl: 'https://example.com',
  requestOptions: { maxDepth: 2 },
  executionTimeMs: 123.45,
  responseHash: 'hash-abc123',
};

await db.insert(activityLog).values(newActivity);

// Type-safe queries
const activities: ActivityLog[] = await db.select().from(activityLog)
  .where(eq(activityLog.userId, 'user-123'))
  .orderBy(desc(activityLog.requestTimestamp))
  .limit(10);
```

## Migration Notes

This schema represents a complete redesign from the previous approach:

### Previous Schema (Removed):
- ❌ `scraped_data` - Stored arbitrary scraping results
- ❌ `extracted_links` - Stored link extraction data
- ❌ `read_response` - Endpoint-specific activity logs
- ❌ `links_response` - Endpoint-specific activity logs

### Current Schema (Active):
- ✅ `activity_log` - Unified activity tracking across all endpoints
- ✅ `response_record` - Deduplicated response storage

### Key Improvements:

1. **Unified Design**: Single activity table for all endpoints instead of separate tables per endpoint
2. **Deduplication**: Response content stored once and referenced by hash
3. **Scalability**: Lightweight activity logs with optional response content fetching
4. **Flexibility**: Generic `path` field supports any endpoint/method combination
5. **Performance**: Optimized indexes for common query patterns
6. **Storage Efficiency**: Fractional milliseconds (real) for precise performance tracking

## Benefits

1. **Deduplication**: Identical responses stored once, saving storage space
2. **Fast Analytics**: Lightweight activity table enables quick queries
3. **Type Safety**: Full TypeScript support through Drizzle ORM
4. **Flexible Querying**: JSON storage allows deep field access with SQLite JSON functions
5. **Performance Optimized**: Strategic indexes for common dashboard and analytics use cases
6. **Scalable**: Separation of concerns between activity tracking and response storage
7. **Future Proof**: Generic design supports new endpoints without schema changes