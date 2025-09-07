ALTER TABLE `activity_log` RENAME COLUMN "endpoint" TO "path";--> statement-breakpoint
DROP INDEX `idx_activity_endpoint_success`;--> statement-breakpoint
DROP INDEX `idx_activity_target_url`;--> statement-breakpoint
DROP INDEX `idx_activity_options_hash`;--> statement-breakpoint
DROP INDEX `idx_activity_user_success`;--> statement-breakpoint
CREATE INDEX `idx_activity_path_success` ON `activity_log` (`path`,`success`);--> statement-breakpoint
CREATE INDEX `idx_activity_request_url` ON `activity_log` (`request_url`);--> statement-breakpoint
CREATE INDEX `idx_activity_request_options` ON `activity_log` (`request_options`);--> statement-breakpoint
CREATE INDEX `idx_activity_user_success` ON `activity_log` (`user_id`,`success`,`path`);--> statement-breakpoint
ALTER TABLE `activity_log` DROP COLUMN `method`;--> statement-breakpoint
ALTER TABLE `activity_log` DROP COLUMN `target_url`;--> statement-breakpoint
ALTER TABLE `activity_log` DROP COLUMN `options_hash`;