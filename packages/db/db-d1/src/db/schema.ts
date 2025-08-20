import { sql } from 'drizzle-orm';
import { blob, integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';

export const scrapedData = sqliteTable('scraped_data', {
  id: text('id').primaryKey(),
  url: text('url').notNull(),
  contentType: text('content_type', {
    enum: ['markdown', 'json', 'html'],
  }).notNull(),
  content: text('content'),
  contentBlob: blob('content_blob'), // For large content when content exceeds text limit
  metadata: text('metadata', { mode: 'json' }), // JSON metadata
  userId: text('user_id'),
  createdAt: text('created_at').notNull().default(sql`(datetime('now'))`),
  updatedAt: text('updated_at').notNull().default(sql`(datetime('now'))`),
});

export const extractedLinks = sqliteTable('extracted_links', {
  id: text('id').primaryKey(),
  sourceUrl: text('source_url').notNull(),
  extractedLinks: text('extracted_links', { mode: 'json' }).notNull(), // JSON array of links
  linkCount: integer('link_count').notNull(),
  userId: text('user_id'),
  createdAt: text('created_at').notNull().default(sql`(datetime('now'))`),
  updatedAt: text('updated_at').notNull().default(sql`(datetime('now'))`),
});

export type ScrapedData = typeof scrapedData.$inferSelect;
export type NewScrapedData = typeof scrapedData.$inferInsert;
export type ExtractedLinks = typeof extractedLinks.$inferSelect;
export type NewExtractedLinks = typeof extractedLinks.$inferInsert;
