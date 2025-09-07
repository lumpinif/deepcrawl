ALTER TABLE `activity_log` RENAME COLUMN "timestamp" TO "request_timestamp";--> statement-breakpoint
DROP INDEX `idx_activity_user_timestamp`;--> statement-breakpoint
CREATE INDEX `idx_activity_user_timestamp` ON `activity_log` (`user_id`,`request_timestamp`);