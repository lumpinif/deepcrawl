CREATE TABLE `activity_log` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text,
	`endpoint` text NOT NULL,
	`method` text NOT NULL,
	`success` integer NOT NULL,
	`timestamp` text NOT NULL,
	`target_url` text NOT NULL,
	`request_url` text NOT NULL,
	`options_hash` text NOT NULL,
	`request_options` text,
	`execution_time_ms` integer,
	`cached` integer,
	`content_id` text,
	`error` text,
	`created_at` text DEFAULT (datetime('now')) NOT NULL
);
--> statement-breakpoint
CREATE INDEX `idx_activity_user_timestamp` ON `activity_log` (`user_id`,`timestamp`);--> statement-breakpoint
CREATE INDEX `idx_activity_endpoint_success` ON `activity_log` (`endpoint`,`success`);--> statement-breakpoint
CREATE INDEX `idx_activity_execution_time` ON `activity_log` (`execution_time_ms`) WHERE "activity_log"."execution_time_ms" IS NOT NULL;--> statement-breakpoint
CREATE INDEX `idx_activity_target_url` ON `activity_log` (`target_url`);--> statement-breakpoint
CREATE INDEX `idx_activity_user_success` ON `activity_log` (`user_id`,`success`,`endpoint`);--> statement-breakpoint
CREATE INDEX `idx_activity_options_hash` ON `activity_log` (`options_hash`);