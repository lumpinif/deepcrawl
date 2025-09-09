ALTER TABLE `response_record` ADD `updated_by` text;--> statement-breakpoint
CREATE INDEX `idx_response_record_updated_by` ON `response_record` (`updated_by`);