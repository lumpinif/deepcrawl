ALTER TABLE `response_record` RENAME COLUMN "response_json" TO "response";--> statement-breakpoint
PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_activity_log` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text,
	`path` text NOT NULL,
	`success` integer NOT NULL,
	`cached` integer,
	`request_timestamp` text NOT NULL,
	`request_url` text NOT NULL,
	`request_options` text,
	`execution_time_ms` real,
	`response_hash` text,
	`error` text,
	`created_at` text DEFAULT (datetime('now')) NOT NULL,
	FOREIGN KEY (`response_hash`) REFERENCES `response_record`(`response_hash`) ON UPDATE cascade ON DELETE set null
);
--> statement-breakpoint
INSERT INTO `__new_activity_log`("id", "user_id", "path", "success", "cached", "request_timestamp", "request_url", "request_options", "execution_time_ms", "response_hash", "error", "created_at") SELECT "id", "user_id", "path", "success", "cached", "request_timestamp", "request_url", "request_options", "execution_time_ms", "response_hash", "error", "created_at" FROM `activity_log`;--> statement-breakpoint
DROP TABLE `activity_log`;--> statement-breakpoint
ALTER TABLE `__new_activity_log` RENAME TO `activity_log`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
CREATE INDEX `idx_activity_user_timestamp` ON `activity_log` (`user_id`,`request_timestamp`);--> statement-breakpoint
CREATE INDEX `idx_activity_path_success` ON `activity_log` (`path`,`success`);--> statement-breakpoint
CREATE INDEX `idx_activity_execution_time` ON `activity_log` (`execution_time_ms`) WHERE "activity_log"."execution_time_ms" IS NOT NULL;--> statement-breakpoint
CREATE INDEX `idx_activity_request_url` ON `activity_log` (`request_url`);--> statement-breakpoint
CREATE INDEX `idx_activity_user_success` ON `activity_log` (`user_id`,`success`,`path`);--> statement-breakpoint
CREATE INDEX `idx_activity_request_options` ON `activity_log` (`request_options`);