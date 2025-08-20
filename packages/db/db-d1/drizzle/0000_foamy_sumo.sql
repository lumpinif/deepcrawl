CREATE TABLE `extracted_links` (
	`id` text PRIMARY KEY NOT NULL,
	`source_url` text NOT NULL,
	`extracted_links` text NOT NULL,
	`link_count` integer NOT NULL,
	`user_id` text,
	`created_at` text DEFAULT (datetime('now')) NOT NULL,
	`updated_at` text DEFAULT (datetime('now')) NOT NULL
);
--> statement-breakpoint
CREATE TABLE `scraped_data` (
	`id` text PRIMARY KEY NOT NULL,
	`url` text NOT NULL,
	`content_type` text NOT NULL,
	`content` text,
	`content_blob` blob,
	`metadata` text,
	`user_id` text,
	`created_at` text DEFAULT (datetime('now')) NOT NULL,
	`updated_at` text DEFAULT (datetime('now')) NOT NULL
);
