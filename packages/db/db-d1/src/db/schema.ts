import { sql } from 'drizzle-orm';
import {
  index,
  integer,
  real,
  sqliteTable,
  text,
} from 'drizzle-orm/sqlite-core';

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
    path: text('path').notNull(), // such as 'read-getMarkdown' or 'links-extractLinks'
    success: integer('success', { mode: 'boolean' }).notNull(),
    cached: integer('cached', { mode: 'boolean' }),
    requestTimestamp: text('request_timestamp').notNull(),

    // URL and options
    requestUrl: text('request_url').notNull(), // Original URL before normalization
    requestOptions: text('request_options', { mode: 'json' }), // Full options JSON for reference

    // Performance metrics (fractional milliseconds)
    executionTimeMs: real('execution_time_ms'),

    // Response hash reference
    responseHash: text('response_hash').references(
      () => responseRecord.responseHash,
      { onDelete: 'set null', onUpdate: 'cascade' },
    ),
    // Response metadata reference such as metrics or full error response if success is false
    responseMetadata: text('response_metadata', { mode: 'json' }),

    // Error handling
    error: text('error'), // NULL if success = true

    // Timestamps
    createdAt: text('created_at').notNull().default(sql`(datetime('now'))`),
  },
  (table) => [
    // Primary user activity queries (dashboard timeline)
    index('idx_activity_user_timestamp').on(
      table.userId,
      table.requestTimestamp,
    ),

    // Endpoint-specific queries
    index('idx_activity_path_success').on(table.path, table.success),

    // Performance analytics
    index('idx_activity_execution_time')
      .on(table.executionTimeMs)
      .where(sql`${table.executionTimeMs} IS NOT NULL`),

    // URL-based queries
    index('idx_activity_request_url').on(table.requestUrl),

    // User success rate analysis
    index('idx_activity_user_success').on(
      table.userId,
      table.success,
      table.path,
    ),

    // Options hash for future content linking
    index('idx_activity_request_options').on(table.requestOptions),
  ],
);

/**
 * Store full response records for both read and links endpoints
 * Response storage - deduplicated response by hash
 */
export const responseRecord = sqliteTable(
  'response_record',
  {
    // Primary key - response hash for deduplication
    responseHash: text('response_hash').primaryKey(),

    // Request identification
    path: text('path').notNull(), // such as 'read-getMarkdown' or 'links-extractLinks'
    optionsHash: text('options_hash').notNull(),

    // actual response content field
    responseContent: text('response_content', { mode: 'json' }),

    // content management
    responseSize: integer('response_size'),

    // Timestamps
    createdAt: text('created_at').notNull().default(sql`(datetime('now'))`),
    updatedAt: text('updated_at').notNull().default(sql`(datetime('now'))`),
  },
  (table) => [
    // Response hash lookup
    index('idx_response_record_response_hash').on(table.responseHash),

    // Options hash lookup
    index('idx_response_record_options').on(table.optionsHash),

    // Path lookup
    index('idx_response_record_path').on(table.path),

    // Updated at lookup
    index('idx_response_record_updated_at').on(table.updatedAt),

    // Created at lookup
    index('idx_response_record_created_at').on(table.createdAt),
  ],
);

// TypeScript types for all tables
export type ActivityLog = typeof activityLog.$inferSelect;
export type NewActivityLog = typeof activityLog.$inferInsert;
export type ResponseRecord = typeof responseRecord.$inferSelect;
export type NewResponseRecord = typeof responseRecord.$inferInsert;
