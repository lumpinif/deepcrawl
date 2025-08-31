import { sql } from 'drizzle-orm';
import { index, integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';

/**
 * Read endpoint activity logs - mirrors ReadSuccessResponse and ReadErrorResponse schemas
 * Stores both successful responses and errors in a unified table for better analytics
 */
export const readResponse = sqliteTable(
  'read_response',
  {
    // Metadata
    id: text('id').primaryKey(),
    userId: text('user_id'),
    method: text('method').notNull(), // 'getMarkdown' or 'readUrl'

    // Common fields (present in both success and error)
    success: integer('success', { mode: 'boolean' }).notNull(),
    targetUrl: text('target_url').notNull(),

    // Request data (always present)
    requestUrl: text('request_url').notNull(),
    requestOptions: text('request_options', { mode: 'json' }), // ReadOptionsSchema

    // ReadSuccessResponse fields (null for errors) - mirror ReadSuccessResponseSchema
    cached: integer('cached', { mode: 'boolean' }),
    timestamp: text('timestamp'),
    title: text('title'),
    description: text('description'),
    markdown: text('markdown'), // Can be plain string (getMarkdown) or part of JSON (readUrl)
    rawHtml: text('raw_html'),
    cleanedHtml: text('cleaned_html'),
    metadata: text('metadata', { mode: 'json' }), // PageMetadataSchema
    metaFiles: text('meta_files', { mode: 'json' }), // MetaFilesSchema
    metrics: text('metrics', { mode: 'json' }), // MetricsSchema

    // Error fields (null for success) - mirror ReadErrorResponseSchema
    error: text('error'), // Error message from BaseErrorResponseSchema

    // Performance tracking (extracted for quick queries)
    executionTimeMs: integer('execution_time_ms'),

    // Timestamps
    createdAt: text('created_at').notNull().default(sql`(datetime('now'))`),
    updatedAt: text('updated_at').notNull().default(sql`(datetime('now'))`),
  },
  (table) => [
    // Primary user activity queries (dashboard timeline)
    index('idx_read_response_user_created').on(table.userId, table.createdAt),

    // Success rate analytics
    index('idx_read_response_success').on(table.success),

    // Method-specific analytics
    index('idx_read_response_method').on(table.method),

    // URL-based queries
    index('idx_read_response_target_url').on(table.targetUrl),

    // Performance analytics with conditional WHERE
    index('idx_read_response_execution_time')
      .on(table.executionTimeMs)
      .where(sql`${table.executionTimeMs} IS NOT NULL`),

    // Combined index for user success rate analysis
    index('idx_read_response_user_success_method').on(
      table.userId,
      table.success,
      table.method,
    ),

    // Timestamp-based analytics
    index('idx_read_response_timestamp')
      .on(table.timestamp)
      .where(sql`${table.timestamp} IS NOT NULL`),
  ],
);

/**
 * Links endpoint activity logs - mirrors LinksSuccessResponse and LinksErrorResponse schemas
 * Stores both successful responses and errors in a unified table for better analytics
 */
export const linksResponse = sqliteTable(
  'links_response',
  {
    // Metadata
    id: text('id').primaryKey(),
    userId: text('user_id'),
    method: text('method').notNull(), // 'getLinks' or 'extractLinks'

    // Common fields (present in both success and error)
    success: integer('success', { mode: 'boolean' }).notNull(),
    targetUrl: text('target_url').notNull(),
    timestamp: text('timestamp').notNull(), // Present in both success/error for links

    // Request data (always present)
    requestUrl: text('request_url').notNull(),
    requestOptions: text('request_options', { mode: 'json' }), // LinksOptionsSchema

    // LinksSuccessResponse fields (null for errors) - mirror LinksSuccessResponseSchema
    cached: integer('cached', { mode: 'boolean' }),
    executionTime: text('execution_time'),
    title: text('title'),
    description: text('description'),
    cleanedHtml: text('cleaned_html'),
    metadata: text('metadata', { mode: 'json' }), // PageMetadataSchema
    metaFiles: text('meta_files', { mode: 'json' }), // MetaFilesSchema
    ancestors: text('ancestors', { mode: 'json' }), // z.array(z.string())
    skippedUrls: text('skipped_urls', { mode: 'json' }), // SkippedLinksSchema
    extractedLinks: text('extracted_links', { mode: 'json' }), // ExtractedLinksSchema
    tree: text('tree', { mode: 'json' }), // LinksTreeSchema (can be partial on error)

    // Error fields (null for success) - mirror LinksErrorResponseSchema
    error: text('error'), // Error message from BaseErrorResponseSchema

    // Performance tracking (extracted for quick queries)
    executionTimeMs: integer('execution_time_ms'),
    totalUrls: integer('total_urls'), // Extracted from tree for quick access

    // Timestamps
    createdAt: text('created_at').notNull().default(sql`(datetime('now'))`),
    updatedAt: text('updated_at').notNull().default(sql`(datetime('now'))`),
  },
  (table) => [
    // Primary user activity queries (dashboard timeline)
    index('idx_links_response_user_created').on(table.userId, table.createdAt),

    // Success rate analytics
    index('idx_links_response_success').on(table.success),

    // Method-specific analytics
    index('idx_links_response_method').on(table.method),

    // URL-based queries
    index('idx_links_response_target_url').on(table.targetUrl),

    // Performance analytics with conditional WHERE
    index('idx_links_response_execution_time')
      .on(table.executionTimeMs)
      .where(sql`${table.executionTimeMs} IS NOT NULL`),

    // Tree size analytics
    index('idx_links_response_total_urls')
      .on(table.totalUrls)
      .where(sql`${table.totalUrls} IS NOT NULL`),

    // Combined index for user success rate analysis
    index('idx_links_response_user_success_method').on(
      table.userId,
      table.success,
      table.method,
    ),

    // Timestamp-based analytics
    index('idx_links_response_timestamp').on(table.timestamp),
  ],
);

// TypeScript types for the new tables
export type ReadResponse = typeof readResponse.$inferSelect;
export type NewReadResponse = typeof readResponse.$inferInsert;
export type LinksResponse = typeof linksResponse.$inferSelect;
export type NewLinksResponse = typeof linksResponse.$inferInsert;
