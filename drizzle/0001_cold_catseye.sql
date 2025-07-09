CREATE TABLE "properties_files" (
	"id" serial PRIMARY KEY NOT NULL,
	"property_id" integer NOT NULL,
	"file_id" integer NOT NULL,
	"is_primary" boolean DEFAULT false NOT NULL,
	"display_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "properties" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" varchar(255) NOT NULL,
	"description" text NOT NULL,
	"price" numeric(12, 2) NOT NULL,
	"location" varchar(255) NOT NULL,
	"address" varchar(500) NOT NULL,
	"bedrooms" integer NOT NULL,
	"bathrooms" integer NOT NULL,
	"area" numeric(10, 2) NOT NULL,
	"property_type" varchar(50) NOT NULL,
	"listing_type" varchar(50) NOT NULL,
	"is_available" boolean DEFAULT true NOT NULL,
	"is_featured" boolean DEFAULT false NOT NULL,
	"amenities" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"latitude" double precision,
	"longitude" double precision,
	"year_built" integer,
	"parking_spaces" integer DEFAULT 0,
	"agent_name" varchar(255),
	"agent_phone" varchar(255),
	"agent_email" varchar(255),
	"virtual_tour_url" varchar(500),
	"monthly_rent" numeric(10, 2),
	"annual_appreciation_rate" numeric(5, 2),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"added_by" integer
);
--> statement-breakpoint
ALTER TABLE "properties_files" ADD CONSTRAINT "properties_files_property_id_properties_id_fk" FOREIGN KEY ("property_id") REFERENCES "public"."properties"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "properties_files" ADD CONSTRAINT "properties_files_file_id_files_id_fk" FOREIGN KEY ("file_id") REFERENCES "public"."files"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "properties" ADD CONSTRAINT "properties_added_by_users_id_fk" FOREIGN KEY ("added_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "property_id_idx" ON "properties_files" USING btree ("property_id");--> statement-breakpoint
CREATE INDEX "file_id_idx" ON "properties_files" USING btree ("file_id");