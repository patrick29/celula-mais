CREATE TABLE "cell_members" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"cell_group_id" uuid NOT NULL,
	"person_id" uuid NOT NULL,
	"joined_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "cell_members" ADD CONSTRAINT "cell_members_cell_group_id_cell_groups_id_fk" FOREIGN KEY ("cell_group_id") REFERENCES "public"."cell_groups"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cell_members" ADD CONSTRAINT "cell_members_person_id_persons_id_fk" FOREIGN KEY ("person_id") REFERENCES "public"."persons"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "idx_cell_members_unique" ON "cell_members" USING btree ("cell_group_id","person_id");--> statement-breakpoint
CREATE INDEX "idx_cell_members_cell" ON "cell_members" USING btree ("cell_group_id");--> statement-breakpoint
CREATE INDEX "idx_cell_members_person" ON "cell_members" USING btree ("person_id");