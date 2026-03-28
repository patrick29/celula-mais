ALTER TABLE "persons" ADD COLUMN "church_life_events" jsonb DEFAULT '[]'::jsonb;--> statement-breakpoint
ALTER TABLE "persons" DROP COLUMN "is_baptized";--> statement-breakpoint
ALTER TABLE "persons" DROP COLUMN "is_in_discipleship";--> statement-breakpoint
ALTER TABLE "persons" DROP COLUMN "is_leader_in_training";