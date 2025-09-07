CREATE TABLE `activity_log` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text,
	`path` text NOT NULL,
	`success` integer NOT NULL,
	`cached` integer,
	`request_timestamp` text NOT NULL,
	`request_url` text NOT NULL,
	`request_options` text,
	`execution_time_ms` integer,
	`response_hash` text,
	`error` text,
	`created_at` text DEFAULT (datetime('now')) NOT NULL,
	FOREIGN KEY (`response_hash`) REFERENCES `response_record`(`response_hash`) ON UPDATE cascade ON DELETE set null
);
--> statement-breakpoint
CREATE INDEX `idx_activity_user_timestamp` ON `activity_log` (`user_id`,`request_timestamp`);--> statement-breakpoint
CREATE INDEX `idx_activity_path_success` ON `activity_log` (`path`,`success`);--> statement-breakpoint
CREATE INDEX `idx_activity_execution_time` ON `activity_log` (`execution_time_ms`) WHERE "activity_log"."execution_time_ms" IS NOT NULL;--> statement-breakpoint
CREATE INDEX `idx_activity_request_url` ON `activity_log` (`request_url`);--> statement-breakpoint
CREATE INDEX `idx_activity_user_success` ON `activity_log` (`user_id`,`success`,`path`);--> statement-breakpoint
CREATE INDEX `idx_activity_request_options` ON `activity_log` (`request_options`);--> statement-breakpoint
CREATE TABLE `response_record` (
	`response_hash` text PRIMARY KEY NOT NULL,
	`path` text NOT NULL,
	`options_hash` text NOT NULL,
	`response_json` text,
	`response_size` integer,
	`created_at` text DEFAULT (datetime('now')) NOT NULL,
	`updated_at` text DEFAULT (datetime('now')) NOT NULL
);
--> statement-breakpoint
CREATE INDEX `idx_response_record_options` ON `response_record` (`options_hash`);--> statement-breakpoint
CREATE INDEX `idx_response_record_path` ON `response_record` (`path`);