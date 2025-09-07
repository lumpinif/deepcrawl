CREATE INDEX `idx_response_record_response_hash` ON `response_record` (`response_hash`);--> statement-breakpoint
CREATE INDEX `idx_response_record_updated_at` ON `response_record` (`updated_at`);--> statement-breakpoint
CREATE INDEX `idx_response_record_created_at` ON `response_record` (`created_at`);--> statement-breakpoint
ALTER TABLE `response_record` DROP COLUMN `response`;