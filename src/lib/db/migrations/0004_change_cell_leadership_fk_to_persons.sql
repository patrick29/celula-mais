ALTER TABLE "cell_groups" DROP CONSTRAINT "cell_groups_leader_id_users_id_fk";
--> statement-breakpoint
ALTER TABLE "cell_groups" DROP CONSTRAINT "cell_groups_co_leader_id_users_id_fk";
--> statement-breakpoint
ALTER TABLE "cell_groups" DROP CONSTRAINT "cell_groups_host_id_users_id_fk";
--> statement-breakpoint
ALTER TABLE "cell_groups" DROP CONSTRAINT "cell_groups_supervisor_id_users_id_fk";
--> statement-breakpoint
ALTER TABLE "cell_groups" ADD CONSTRAINT "cell_groups_leader_id_persons_id_fk" FOREIGN KEY ("leader_id") REFERENCES "public"."persons"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cell_groups" ADD CONSTRAINT "cell_groups_co_leader_id_persons_id_fk" FOREIGN KEY ("co_leader_id") REFERENCES "public"."persons"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cell_groups" ADD CONSTRAINT "cell_groups_host_id_persons_id_fk" FOREIGN KEY ("host_id") REFERENCES "public"."persons"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cell_groups" ADD CONSTRAINT "cell_groups_supervisor_id_persons_id_fk" FOREIGN KEY ("supervisor_id") REFERENCES "public"."persons"("id") ON DELETE set null ON UPDATE no action;