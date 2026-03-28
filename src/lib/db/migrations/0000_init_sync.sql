CREATE TYPE "public"."attendance_status" AS ENUM('PRESENT', 'ABSENT', 'VISITOR');--> statement-breakpoint
CREATE TYPE "public"."cell_group_type" AS ENUM('CHILDREN', 'YOUNG_ADULTS', 'TEENAGERS', 'ADULTS');--> statement-breakpoint
CREATE TYPE "public"."cell_status" AS ENUM('ACTIVE', 'PLANTING', 'PAUSED', 'CLOSED');--> statement-breakpoint
CREATE TYPE "public"."gender" AS ENUM('MALE', 'FEMALE', 'OTHER');--> statement-breakpoint
CREATE TYPE "public"."person_role" AS ENUM('MEMBER', 'VISITOR', 'LEADER', 'CO_LEADER', 'HOST', 'SUPERVISOR');--> statement-breakpoint
CREATE TYPE "public"."user_role" AS ENUM('ADMIN', 'PASTOR', 'SUPERVISOR', 'LEADER', 'ASSISTANT');--> statement-breakpoint
CREATE TABLE "cell_groups" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"church_id" uuid NOT NULL,
	"region_id" uuid,
	"leader_id" uuid,
	"co_leader_id" uuid,
	"host_id" uuid,
	"supervisor_id" uuid,
	"cell_group_type" "cell_group_type" NOT NULL,
	"name" text NOT NULL,
	"meeting_day" text,
	"meeting_time" text,
	"address_line" text,
	"neighborhood" text,
	"city" text,
	"state" text,
	"status" "cell_status" DEFAULT 'ACTIVE' NOT NULL,
	"start_date" date,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "churches" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"city" text,
	"state" text,
	"country" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "meeting_attendance" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"meeting_id" uuid NOT NULL,
	"person_id" uuid NOT NULL,
	"status" "attendance_status" NOT NULL,
	"absence_reason" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "meeting_attendance_meeting_id_person_id_unique" UNIQUE("meeting_id","person_id")
);
--> statement-breakpoint
CREATE TABLE "meetings" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"cell_group_id" uuid NOT NULL,
	"meeting_date" date NOT NULL,
	"topic" text,
	"notes" text,
	"member_count" integer DEFAULT 0,
	"visitor_count" integer DEFAULT 0,
	"children_count" integer DEFAULT 0,
	"total_count" integer DEFAULT 0,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "persons" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"church_id" uuid NOT NULL,
	"cell_group_id" uuid,
	"full_name" text NOT NULL,
	"phone" text,
	"birth_date" date,
	"gender" "gender",
	"marital_status" text,
	"address_line" text,
	"neighborhood" text,
	"role" "person_role" DEFAULT 'MEMBER' NOT NULL,
	"joined_at" date,
	"is_baptized" boolean DEFAULT false,
	"is_in_discipleship" boolean DEFAULT false,
	"is_leader_in_training" boolean DEFAULT false,
	"notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"full_name" text NOT NULL,
	"email" text NOT NULL,
	"phone" text,
	"password_hash" text NOT NULL,
	"role" "user_role" NOT NULL,
	"church_id" uuid NOT NULL,
	"supervisor_id" uuid,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "visitors" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"church_id" uuid NOT NULL,
	"cell_group_id" uuid,
	"full_name" text NOT NULL,
	"phone" text,
	"invited_by_person_id" uuid,
	"first_visit_date" date,
	"visit_count" integer DEFAULT 1,
	"follow_up_done" boolean DEFAULT false,
	"became_member" boolean DEFAULT false,
	"interested_in_discipleship" boolean DEFAULT false,
	"notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "cell_groups" ADD CONSTRAINT "cell_groups_church_id_churches_id_fk" FOREIGN KEY ("church_id") REFERENCES "public"."churches"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cell_groups" ADD CONSTRAINT "cell_groups_leader_id_users_id_fk" FOREIGN KEY ("leader_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cell_groups" ADD CONSTRAINT "cell_groups_co_leader_id_users_id_fk" FOREIGN KEY ("co_leader_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cell_groups" ADD CONSTRAINT "cell_groups_host_id_users_id_fk" FOREIGN KEY ("host_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cell_groups" ADD CONSTRAINT "cell_groups_supervisor_id_users_id_fk" FOREIGN KEY ("supervisor_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "meeting_attendance" ADD CONSTRAINT "meeting_attendance_meeting_id_meetings_id_fk" FOREIGN KEY ("meeting_id") REFERENCES "public"."meetings"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "meeting_attendance" ADD CONSTRAINT "meeting_attendance_person_id_persons_id_fk" FOREIGN KEY ("person_id") REFERENCES "public"."persons"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "meetings" ADD CONSTRAINT "meetings_cell_group_id_cell_groups_id_fk" FOREIGN KEY ("cell_group_id") REFERENCES "public"."cell_groups"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "persons" ADD CONSTRAINT "persons_church_id_churches_id_fk" FOREIGN KEY ("church_id") REFERENCES "public"."churches"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "persons" ADD CONSTRAINT "persons_cell_group_id_cell_groups_id_fk" FOREIGN KEY ("cell_group_id") REFERENCES "public"."cell_groups"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "users_church_id_churches_id_fk" FOREIGN KEY ("church_id") REFERENCES "public"."churches"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "users_supervisor_id_users_id_fk" FOREIGN KEY ("supervisor_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "visitors" ADD CONSTRAINT "visitors_church_id_churches_id_fk" FOREIGN KEY ("church_id") REFERENCES "public"."churches"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "visitors" ADD CONSTRAINT "visitors_cell_group_id_cell_groups_id_fk" FOREIGN KEY ("cell_group_id") REFERENCES "public"."cell_groups"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "visitors" ADD CONSTRAINT "visitors_invited_by_person_id_persons_id_fk" FOREIGN KEY ("invited_by_person_id") REFERENCES "public"."persons"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_cells_church" ON "cell_groups" USING btree ("church_id");--> statement-breakpoint
CREATE INDEX "idx_cells_supervisor" ON "cell_groups" USING btree ("supervisor_id");--> statement-breakpoint
CREATE INDEX "idx_attendance_meeting" ON "meeting_attendance" USING btree ("meeting_id");--> statement-breakpoint
CREATE INDEX "idx_attendance_person" ON "meeting_attendance" USING btree ("person_id");--> statement-breakpoint
CREATE INDEX "idx_meetings_cell" ON "meetings" USING btree ("cell_group_id");--> statement-breakpoint
CREATE INDEX "idx_persons_church" ON "persons" USING btree ("church_id");--> statement-breakpoint
CREATE INDEX "idx_persons_cell" ON "persons" USING btree ("cell_group_id");--> statement-breakpoint
CREATE INDEX "idx_users_church" ON "users" USING btree ("church_id");--> statement-breakpoint
CREATE INDEX "idx_users_supervisor" ON "users" USING btree ("supervisor_id");--> statement-breakpoint
CREATE INDEX "idx_visitors_church" ON "visitors" USING btree ("church_id");--> statement-breakpoint
CREATE INDEX "idx_visitors_cell" ON "visitors" USING btree ("cell_group_id");