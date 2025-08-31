CREATE TABLE `links_response` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text,
	`method` text NOT NULL,
	`success` integer NOT NULL,
	`target_url` text NOT NULL,
	`timestamp` text NOT NULL,
	`request_url` text NOT NULL,
	`request_options` text,
	`cached` integer,
	`execution_time` text,
	`title` text,
	`description` text,
	`cleaned_html` text,
	`metadata` text,
	`meta_files` text,
	`ancestors` text,
	`skipped_urls` text,
	`extracted_links` text,
	`tree` text,
	`error` text,
	`execution_time_ms` integer,
	`total_urls` integer,
	`created_at` text DEFAULT (datetime('now')) NOT NULL,
	`updated_at` text DEFAULT (datetime('now')) NOT NULL
);
--> statement-breakpoint
CREATE INDEX `idx_links_response_user_created` ON `links_response` (`user_id`,`created_at`);--> statement-breakpoint
CREATE INDEX `idx_links_response_success` ON `links_response` (`success`);--> statement-breakpoint
CREATE INDEX `idx_links_response_method` ON `links_response` (`method`);--> statement-breakpoint
CREATE INDEX `idx_links_response_target_url` ON `links_response` (`target_url`);--> statement-breakpoint
CREATE INDEX `idx_links_response_execution_time` ON `links_response` (`execution_time_ms`) WHERE "links_response"."execution_time_ms" IS NOT NULL;--> statement-breakpoint
CREATE INDEX `idx_links_response_total_urls` ON `links_response` (`total_urls`) WHERE "links_response"."total_urls" IS NOT NULL;--> statement-breakpoint
CREATE INDEX `idx_links_response_user_success_method` ON `links_response` (`user_id`,`success`,`method`);--> statement-breakpoint
CREATE INDEX `idx_links_response_timestamp` ON `links_response` (`timestamp`);--> statement-breakpoint
CREATE TABLE `read_response` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text,
	`method` text NOT NULL,
	`success` integer NOT NULL,
	`target_url` text NOT NULL,
	`request_url` text NOT NULL,
	`request_options` text,
	`cached` integer,
	`timestamp` text,
	`title` text,
	`description` text,
	`markdown` text,
	`raw_html` text,
	`cleaned_html` text,
	`metadata` text,
	`meta_files` text,
	`metrics` text,
	`error` text,
	`execution_time_ms` integer,
	`created_at` text DEFAULT (datetime('now')) NOT NULL,
	`updated_at` text DEFAULT (datetime('now')) NOT NULL
);
--> statement-breakpoint
CREATE INDEX `idx_read_response_user_created` ON `read_response` (`user_id`,`created_at`);--> statement-breakpoint
CREATE INDEX `idx_read_response_success` ON `read_response` (`success`);--> statement-breakpoint
CREATE INDEX `idx_read_response_method` ON `read_response` (`method`);--> statement-breakpoint
CREATE INDEX `idx_read_response_target_url` ON `read_response` (`target_url`);--> statement-breakpoint
CREATE INDEX `idx_read_response_execution_time` ON `read_response` (`execution_time_ms`) WHERE "read_response"."execution_time_ms" IS NOT NULL;--> statement-breakpoint
CREATE INDEX `idx_read_response_user_success_method` ON `read_response` (`user_id`,`success`,`method`);--> statement-breakpoint
CREATE INDEX `idx_read_response_timestamp` ON `read_response` (`timestamp`) WHERE "read_response"."timestamp" IS NOT NULL;