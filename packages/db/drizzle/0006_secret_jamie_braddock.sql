ALTER TABLE "apikey" ALTER COLUMN "rate_limit_time_window" SET DEFAULT 60000;--> statement-breakpoint
ALTER TABLE "apikey" ALTER COLUMN "rate_limit_max" SET DEFAULT 20;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "normalized_email" text;--> statement-breakpoint
ALTER TABLE "user" ADD CONSTRAINT "user_normalized_email_unique" UNIQUE("normalized_email");