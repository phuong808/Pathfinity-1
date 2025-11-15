ALTER TABLE "major_career_mappings" ALTER COLUMN "credits" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "chats" ADD COLUMN "extracted_dream_job" text;--> statement-breakpoint
ALTER TABLE "chats" ADD COLUMN "extracted_major" text;--> statement-breakpoint
ALTER TABLE "chats" ADD COLUMN "profile_data_extracted" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "profiles" ADD COLUMN "dream_job" text;--> statement-breakpoint
ALTER TABLE "profiles" ADD COLUMN "user_type" text;--> statement-breakpoint
ALTER TABLE "profiles" ADD COLUMN "strengths" jsonb;--> statement-breakpoint
ALTER TABLE "profiles" ADD COLUMN "weaknesses" jsonb;--> statement-breakpoint
ALTER TABLE "profiles" ADD COLUMN "experience" jsonb;--> statement-breakpoint
ALTER TABLE "profiles" ADD COLUMN "job_preference" jsonb;--> statement-breakpoint
CREATE INDEX "profile_user_idx" ON "profiles" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "profile_dream_job_idx" ON "profiles" USING btree ("dream_job");--> statement-breakpoint
CREATE INDEX "profile_major_idx" ON "profiles" USING btree ("major");--> statement-breakpoint
CREATE INDEX "profile_user_type_idx" ON "profiles" USING btree ("user_type");