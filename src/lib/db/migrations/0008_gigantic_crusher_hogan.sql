ALTER TABLE "meetings" ALTER COLUMN "initial_prayer" SET DATA TYPE uuid;--> statement-breakpoint
ALTER TABLE "meetings" ALTER COLUMN "final_prayer" SET DATA TYPE uuid;--> statement-breakpoint
ALTER TABLE "meetings" ADD COLUMN "responsible_for_reflection" uuid;--> statement-breakpoint
ALTER TABLE "meetings" ADD CONSTRAINT "meetings_initial_prayer_persons_id_fk" FOREIGN KEY ("initial_prayer") REFERENCES "public"."persons"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "meetings" ADD CONSTRAINT "meetings_final_prayer_persons_id_fk" FOREIGN KEY ("final_prayer") REFERENCES "public"."persons"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "meetings" ADD CONSTRAINT "meetings_responsible_for_reflection_persons_id_fk" FOREIGN KEY ("responsible_for_reflection") REFERENCES "public"."persons"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "meetings" DROP COLUMN "reflection";