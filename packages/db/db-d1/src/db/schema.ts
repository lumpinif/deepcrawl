import { sql } from 'drizzle-orm';
import { index, integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';

/**
 * Unified activity log - tracks all API requests across endpoints
 * Lightweight table for fast activity tracking and analytics
 */
export const activityLog = sqliteTable(
  'activity_log',
  {
    // Primary identification
    id: text('id').primaryKey(),
    userId: text('user_id'),

    // Request metadata
    endpoint: text('endpoint').notNull(), // 'read' or 'links'
    method: text('method').notNull(), // 'GET' or 'POST'
    success: integer('success', { mode: 'boolean' }).notNull(),
    timestamp: text('timestamp').notNull(),

    // URL and options
    targetUrl: text('target_url').notNull(),
    requestUrl: text('request_url').notNull(), // Original URL before normalization
    optionsHash: text('options_hash').notNull(), // Hash of request options
    requestOptions: text('request_options', { mode: 'json' }), // Full options JSON for reference

    // Performance metrics
    executionTimeMs: integer('execution_time_ms'),
    cached: integer('cached', { mode: 'boolean' }),

    // Future content reference (NULL for Phase 1)
    contentId: text('content_id'), // Will reference content tables in Phase 2

    // Error handling
    error: text('error'), // NULL if success = true

    // Timestamps
    createdAt: text('created_at').notNull().default(sql`(datetime('now'))`),
  },
  (table) => [
    // Primary user activity queries (dashboard timeline)
    index('idx_activity_user_timestamp').on(table.userId, table.timestamp),

    // Endpoint-specific queries
    index('idx_activity_endpoint_success').on(table.endpoint, table.success),

    // Performance analytics
    index('idx_activity_execution_time')
      .on(table.executionTimeMs)
      .where(sql`${table.executionTimeMs} IS NOT NULL`),

    // URL-based queries
    index('idx_activity_target_url').on(table.targetUrl),

    // User success rate analysis
    index('idx_activity_user_success').on(
      table.userId,
      table.success,
      table.endpoint,
    ),

    // Options hash for future content linking
    index('idx_activity_options_hash').on(table.optionsHash),
  ],
);

/**
 * Read content storage - deduplicated content by hash
 * Separates content from activity for efficient storage and retrieval
 */
export const readContent = sqliteTable(
  'read_content',
  {
    // Primary key - content hash for deduplication
    contentHash: text('content_hash').primaryKey(),

    // Request identification
    targetUrl: text('target_url').notNull(),
    optionsHash: text('options_hash').notNull(),

    // Read response content
    markdown: text('markdown'),
    rawHtml: text('raw_html'),
    cleanedHtml: text('cleaned_html'),
    title: text('title'),
    description: text('description'),
    metadata: text('metadata', { mode: 'json' }),
    metaFiles: text('meta_files', { mode: 'json' }),
    metrics: text('metrics', { mode: 'json' }),

    // Content management
    contentSize: integer('content_size'), // Total content size in bytes
    firstSeen: text('first_seen').notNull(),
    lastAccessed: text('last_accessed').notNull(),
    accessCount: integer('access_count').notNull().default(1),

    // Timestamps
    createdAt: text('created_at').notNull().default(sql`(datetime('now'))`),
    updatedAt: text('updated_at').notNull().default(sql`(datetime('now'))`),
  },
  (table) => [
    // Content lookup by URL and options
    index('idx_read_content_target_options').on(
      table.targetUrl,
      table.optionsHash,
    ),

    // Content cleanup queries
    index('idx_read_content_last_accessed').on(table.lastAccessed),
    index('idx_read_content_access_count').on(table.accessCount),

    // Storage analytics
    index('idx_read_content_size').on(table.contentSize),
    index('idx_read_content_first_seen').on(table.firstSeen),

    // Target URL analytics
    index('idx_read_content_target_url').on(table.targetUrl),
  ],
);

/**
 * Links content storage - deduplicated content by hash
 * Separates content from activity for efficient storage and retrieval
 */
export const linksContent = sqliteTable(
  'links_content',
  {
    // Primary key - content hash for deduplication
    contentHash: text('content_hash').primaryKey(),

    // Request identification
    targetUrl: text('target_url').notNull(),
    optionsHash: text('options_hash').notNull(),

    // Links response content
    tree: text('tree', { mode: 'json' }),
    extractedLinks: text('extracted_links', { mode: 'json' }),
    ancestors: text('ancestors', { mode: 'json' }),
    skippedUrls: text('skipped_urls', { mode: 'json' }),
    title: text('title'),
    description: text('description'),
    cleanedHtml: text('cleaned_html'),
    metadata: text('metadata', { mode: 'json' }),

    // Content management
    contentSize: integer('content_size'), // Total content size in bytes
    totalUrls: integer('total_urls'), // Extracted from tree for analytics
    firstSeen: text('first_seen').notNull(),
    lastAccessed: text('last_accessed').notNull(),
    accessCount: integer('access_count').notNull().default(1),

    // Timestamps
    createdAt: text('created_at').notNull().default(sql`(datetime('now'))`),
    updatedAt: text('updated_at').notNull().default(sql`(datetime('now'))`),
  },
  (table) => [
    // Content lookup by URL and options
    index('idx_links_content_target_options').on(
      table.targetUrl,
      table.optionsHash,
    ),

    // Content cleanup queries
    index('idx_links_content_last_accessed').on(table.lastAccessed),
    index('idx_links_content_access_count').on(table.accessCount),

    // Storage analytics
    index('idx_links_content_size').on(table.contentSize),
    index('idx_links_content_total_urls').on(table.totalUrls),
    index('idx_links_content_first_seen').on(table.firstSeen),

    // Target URL analytics
    index('idx_links_content_target_url').on(table.targetUrl),
  ],
);

// TypeScript types for all tables
export type ActivityLog = typeof activityLog.$inferSelect;
export type NewActivityLog = typeof activityLog.$inferInsert;
export type ReadContent = typeof readContent.$inferSelect;
export type NewReadContent = typeof readContent.$inferInsert;
export type LinksContent = typeof linksContent.$inferSelect;
export type NewLinksContent = typeof linksContent.$inferInsert;
