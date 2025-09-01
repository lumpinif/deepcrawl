CREATE TABLE `links_content` (
	`content_hash` text PRIMARY KEY NOT NULL,
	`target_url` text NOT NULL,
	`options_hash` text NOT NULL,
	`tree` text,
	`extracted_links` text,
	`ancestors` text,
	`skipped_urls` text,
	`title` text,
	`description` text,
	`cleaned_html` text,
	`metadata` text,
	`content_size` integer,
	`total_urls` integer,
	`first_seen` text NOT NULL,
	`last_accessed` text NOT NULL,
	`access_count` integer DEFAULT 1 NOT NULL,
	`created_at` text DEFAULT (datetime('now')) NOT NULL,
	`updated_at` text DEFAULT (datetime('now')) NOT NULL
);
--> statement-breakpoint
CREATE INDEX `idx_links_content_target_options` ON `links_content` (`target_url`,`options_hash`);--> statement-breakpoint
CREATE INDEX `idx_links_content_last_accessed` ON `links_content` (`last_accessed`);--> statement-breakpoint
CREATE INDEX `idx_links_content_access_count` ON `links_content` (`access_count`);--> statement-breakpoint
CREATE INDEX `idx_links_content_size` ON `links_content` (`content_size`);--> statement-breakpoint
CREATE INDEX `idx_links_content_total_urls` ON `links_content` (`total_urls`);--> statement-breakpoint
CREATE INDEX `idx_links_content_first_seen` ON `links_content` (`first_seen`);--> statement-breakpoint
CREATE INDEX `idx_links_content_target_url` ON `links_content` (`target_url`);--> statement-breakpoint
CREATE TABLE `read_content` (
	`content_hash` text PRIMARY KEY NOT NULL,
	`target_url` text NOT NULL,
	`options_hash` text NOT NULL,
	`markdown` text,
	`raw_html` text,
	`cleaned_html` text,
	`title` text,
	`description` text,
	`metadata` text,
	`meta_files` text,
	`metrics` text,
	`content_size` integer,
	`first_seen` text NOT NULL,
	`last_accessed` text NOT NULL,
	`access_count` integer DEFAULT 1 NOT NULL,
	`created_at` text DEFAULT (datetime('now')) NOT NULL,
	`updated_at` text DEFAULT (datetime('now')) NOT NULL
);
--> statement-breakpoint
CREATE INDEX `idx_read_content_target_options` ON `read_content` (`target_url`,`options_hash`);--> statement-breakpoint
CREATE INDEX `idx_read_content_last_accessed` ON `read_content` (`last_accessed`);--> statement-breakpoint
CREATE INDEX `idx_read_content_access_count` ON `read_content` (`access_count`);--> statement-breakpoint
CREATE INDEX `idx_read_content_size` ON `read_content` (`content_size`);--> statement-breakpoint
CREATE INDEX `idx_read_content_first_seen` ON `read_content` (`first_seen`);--> statement-breakpoint
CREATE INDEX `idx_read_content_target_url` ON `read_content` (`target_url`);