ALTER TABLE "users" ALTER COLUMN "password_hash" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "is_active" boolean DEFAULT true NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "must_change_password" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "last_login_at" timestamp with time zone;--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_users_active" ON "users" ("church_id","is_active");
