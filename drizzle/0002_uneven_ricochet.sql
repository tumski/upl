ALTER TABLE "items" ADD COLUMN "upscaling_attempts" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "items" ADD COLUMN "last_upscaling_attempt" timestamp;