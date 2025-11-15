CREATE TABLE "career_pathways" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"normalized_title" text NOT NULL,
	"category" text,
	"description" text,
	"metadata" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "career_pathways_title_unique" UNIQUE("title")
);
--> statement-breakpoint
CREATE TABLE "course_prerequisites" (
	"id" serial PRIMARY KEY NOT NULL,
	"course_id" integer NOT NULL,
	"prerequisite_course_id" integer,
	"prerequisite_text" text,
	"is_required" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "degree_pathways" (
	"id" serial PRIMARY KEY NOT NULL,
	"degree_program_id" integer NOT NULL,
	"year_number" integer NOT NULL,
	"semester_name" text NOT NULL,
	"semester_credits" integer,
	"sequence_order" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "degree_programs" (
	"id" serial PRIMARY KEY NOT NULL,
	"campus_id" text NOT NULL,
	"degree_id" integer NOT NULL,
	"program_name" text NOT NULL,
	"major_title" text,
	"track" text,
	"total_credits" integer,
	"typical_duration_years" integer,
	"description" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "major_career_mappings" (
	"id" serial PRIMARY KEY NOT NULL,
	"campus_id" text NOT NULL,
	"major_name" text NOT NULL,
	"degree_type" text NOT NULL,
	"credits" integer,
	"career_pathway_ids" jsonb NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "pathway_courses" (
	"id" serial PRIMARY KEY NOT NULL,
	"pathway_id" integer NOT NULL,
	"course_id" integer,
	"course_name" text NOT NULL,
	"credits" integer NOT NULL,
	"category" text,
	"is_elective" boolean DEFAULT false,
	"is_gen_ed" boolean DEFAULT false,
	"notes" text,
	"sequence_order" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "majors" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "major_degrees" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
DROP TABLE "majors" CASCADE;--> statement-breakpoint
DROP TABLE "major_degrees" CASCADE;--> statement-breakpoint
ALTER TABLE "campuses" ADD COLUMN "created_at" timestamp DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "campuses" ADD COLUMN "updated_at" timestamp DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "courses" ADD COLUMN "metadata" text;--> statement-breakpoint
ALTER TABLE "courses" ADD COLUMN "created_at" timestamp DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "courses" ADD COLUMN "updated_at" timestamp DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "degrees" ADD COLUMN "created_at" timestamp DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "degrees" ADD COLUMN "updated_at" timestamp DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "course_prerequisites" ADD CONSTRAINT "course_prerequisites_course_id_courses_id_fk" FOREIGN KEY ("course_id") REFERENCES "public"."courses"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "course_prerequisites" ADD CONSTRAINT "course_prerequisites_prerequisite_course_id_courses_id_fk" FOREIGN KEY ("prerequisite_course_id") REFERENCES "public"."courses"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "degree_pathways" ADD CONSTRAINT "degree_pathways_degree_program_id_degree_programs_id_fk" FOREIGN KEY ("degree_program_id") REFERENCES "public"."degree_programs"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "degree_programs" ADD CONSTRAINT "degree_programs_campus_id_campuses_id_fk" FOREIGN KEY ("campus_id") REFERENCES "public"."campuses"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "degree_programs" ADD CONSTRAINT "degree_programs_degree_id_degrees_id_fk" FOREIGN KEY ("degree_id") REFERENCES "public"."degrees"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "major_career_mappings" ADD CONSTRAINT "major_career_mappings_campus_id_campuses_id_fk" FOREIGN KEY ("campus_id") REFERENCES "public"."campuses"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pathway_courses" ADD CONSTRAINT "pathway_courses_pathway_id_degree_pathways_id_fk" FOREIGN KEY ("pathway_id") REFERENCES "public"."degree_pathways"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pathway_courses" ADD CONSTRAINT "pathway_courses_course_id_courses_id_fk" FOREIGN KEY ("course_id") REFERENCES "public"."courses"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "career_pathway_title_idx" ON "career_pathways" USING btree ("title");--> statement-breakpoint
CREATE INDEX "career_pathway_normalized_idx" ON "career_pathways" USING btree ("normalized_title");--> statement-breakpoint
CREATE INDEX "career_pathway_category_idx" ON "career_pathways" USING btree ("category");--> statement-breakpoint
CREATE INDEX "course_prereq_course_idx" ON "course_prerequisites" USING btree ("course_id");--> statement-breakpoint
CREATE INDEX "course_prereq_prerequisite_idx" ON "course_prerequisites" USING btree ("prerequisite_course_id");--> statement-breakpoint
CREATE INDEX "pathway_program_idx" ON "degree_pathways" USING btree ("degree_program_id");--> statement-breakpoint
CREATE INDEX "pathway_sequence_idx" ON "degree_pathways" USING btree ("degree_program_id","sequence_order");--> statement-breakpoint
CREATE INDEX "pathway_unique_semester" ON "degree_pathways" USING btree ("degree_program_id","year_number","semester_name");--> statement-breakpoint
CREATE INDEX "degree_program_campus_idx" ON "degree_programs" USING btree ("campus_id");--> statement-breakpoint
CREATE INDEX "degree_program_degree_idx" ON "degree_programs" USING btree ("degree_id");--> statement-breakpoint
CREATE INDEX "degree_program_major_idx" ON "degree_programs" USING btree ("major_title");--> statement-breakpoint
CREATE INDEX "major_career_campus_major_idx" ON "major_career_mappings" USING btree ("campus_id","major_name");--> statement-breakpoint
CREATE INDEX "major_career_degree_type_idx" ON "major_career_mappings" USING btree ("degree_type");--> statement-breakpoint
CREATE INDEX "major_career_unique_idx" ON "major_career_mappings" USING btree ("campus_id","major_name");--> statement-breakpoint
CREATE INDEX "pathway_course_pathway_idx" ON "pathway_courses" USING btree ("pathway_id");--> statement-breakpoint
CREATE INDEX "pathway_course_course_idx" ON "pathway_courses" USING btree ("course_id");--> statement-breakpoint
CREATE INDEX "pathway_course_category_idx" ON "pathway_courses" USING btree ("category");--> statement-breakpoint
CREATE INDEX "pathway_course_sequence_idx" ON "pathway_courses" USING btree ("pathway_id","sequence_order");--> statement-breakpoint
CREATE INDEX "campus_inst_ipeds_idx" ON "campuses" USING btree ("inst_ipeds");--> statement-breakpoint
CREATE INDEX "campus_type_idx" ON "campuses" USING btree ("type");--> statement-breakpoint
CREATE INDEX "course_prefix_number_idx" ON "courses" USING btree ("course_prefix","course_number");--> statement-breakpoint
CREATE INDEX "course_campus_idx" ON "courses" USING btree ("campus_id");--> statement-breakpoint
CREATE INDEX "course_dept_idx" ON "courses" USING btree ("dept_name");--> statement-breakpoint
CREATE INDEX "course_unique_campus_course" ON "courses" USING btree ("campus_id","course_prefix","course_number");--> statement-breakpoint
CREATE INDEX "degree_level_idx" ON "degrees" USING btree ("level");