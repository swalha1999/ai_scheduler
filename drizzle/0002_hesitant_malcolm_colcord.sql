CREATE TYPE "public"."appointment_status" AS ENUM('scheduled', 'confirmed', 'in_progress', 'completed', 'cancelled', 'no_show');--> statement-breakpoint
CREATE TYPE "public"."booking_source" AS ENUM('whatsapp', 'web', 'phone', 'walk_in');--> statement-breakpoint
CREATE TYPE "public"."service_type" AS ENUM('haircut', 'haircut_styling', 'coloring', 'treatment', 'other');--> statement-breakpoint
CREATE TYPE "public"."restriction_status" AS ENUM('active', 'inactive', 'expired');--> statement-breakpoint
CREATE TYPE "public"."restriction_type" AS ENUM('blocklist', 'whitelist', 'timeout');--> statement-breakpoint
CREATE TYPE "public"."language" AS ENUM('ar', 'he', 'en');--> statement-breakpoint
CREATE TYPE "public"."direction" AS ENUM('inbound', 'outbound');--> statement-breakpoint
CREATE TYPE "public"."intent" AS ENUM('booking', 'cancellation', 'inquiry', 'greeting', 'off_topic', 'abuse', 'other');--> statement-breakpoint
CREATE TYPE "public"."message_status" AS ENUM('sent', 'delivered', 'read', 'failed');--> statement-breakpoint
CREATE TYPE "public"."message_type" AS ENUM('text', 'image', 'audio', 'document', 'location', 'video');--> statement-breakpoint
CREATE TABLE "appointments" (
	"id" serial PRIMARY KEY NOT NULL,
	"contact_id" integer NOT NULL,
	"service_type" "service_type" DEFAULT 'haircut',
	"duration_minutes" integer DEFAULT 40,
	"scheduled_at" timestamp NOT NULL,
	"end_time" timestamp NOT NULL,
	"status" "appointment_status" DEFAULT 'scheduled',
	"price" integer,
	"customer_notes" text,
	"staff_notes" text,
	"booking_source" "booking_source" DEFAULT 'whatsapp',
	"booking_language" varchar(10) DEFAULT 'ar',
	"reminder_sent" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "contact_restrictions" (
	"id" serial PRIMARY KEY NOT NULL,
	"contact_id" integer NOT NULL,
	"restriction_type" "restriction_type" NOT NULL,
	"status" "restriction_status" DEFAULT 'active' NOT NULL,
	"reason" text,
	"added_by" varchar(255),
	"timeout_until" timestamp,
	"timeout_count" integer DEFAULT 1,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "messages" (
	"id" serial PRIMARY KEY NOT NULL,
	"contact_id" integer NOT NULL,
	"external_id" varchar(255),
	"content" text NOT NULL,
	"message_type" "message_type" DEFAULT 'text',
	"direction" "direction" NOT NULL,
	"status" "message_status" DEFAULT 'sent',
	"language" varchar(10),
	"intent" "intent",
	"is_processed" boolean DEFAULT false,
	"sent_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "developers" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "properties_files" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "properties" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
DROP TABLE "developers" CASCADE;--> statement-breakpoint
DROP TABLE "properties_files" CASCADE;--> statement-breakpoint
DROP TABLE "properties" CASCADE;--> statement-breakpoint
ALTER TABLE "contacts" DROP CONSTRAINT "contacts_added_by_users_id_fk";
--> statement-breakpoint
ALTER TABLE "contacts" ALTER COLUMN "phone" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "contacts" ALTER COLUMN "created_at" SET DATA TYPE timestamp;--> statement-breakpoint
ALTER TABLE "contacts" ALTER COLUMN "created_at" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "contacts" ADD COLUMN "name" varchar(255);--> statement-breakpoint
ALTER TABLE "contacts" ADD COLUMN "whatsapp_id" varchar(255);--> statement-breakpoint
ALTER TABLE "contacts" ADD COLUMN "preferred_language" "language" DEFAULT 'ar';--> statement-breakpoint
ALTER TABLE "contacts" ADD COLUMN "total_bookings" integer DEFAULT 0;--> statement-breakpoint
ALTER TABLE "contacts" ADD COLUMN "total_cancellations" integer DEFAULT 0;--> statement-breakpoint
ALTER TABLE "contacts" ADD COLUMN "notes" text;--> statement-breakpoint
ALTER TABLE "contacts" ADD COLUMN "updated_at" timestamp DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "appointments" ADD CONSTRAINT "appointments_contact_id_contacts_id_fk" FOREIGN KEY ("contact_id") REFERENCES "public"."contacts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "contact_restrictions" ADD CONSTRAINT "contact_restrictions_contact_id_contacts_id_fk" FOREIGN KEY ("contact_id") REFERENCES "public"."contacts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "messages" ADD CONSTRAINT "messages_contact_id_contacts_id_fk" FOREIGN KEY ("contact_id") REFERENCES "public"."contacts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "appointments_contact_id_index" ON "appointments" USING btree ("contact_id");--> statement-breakpoint
CREATE INDEX "appointments_scheduled_at_index" ON "appointments" USING btree ("scheduled_at");--> statement-breakpoint
CREATE INDEX "appointments_status_index" ON "appointments" USING btree ("status");--> statement-breakpoint
CREATE INDEX "appointments_service_type_index" ON "appointments" USING btree ("service_type");--> statement-breakpoint
CREATE INDEX "appointments_date_range_index" ON "appointments" USING btree ("scheduled_at","end_time");--> statement-breakpoint
CREATE INDEX "contact_restrictions_contact_id_index" ON "contact_restrictions" USING btree ("contact_id");--> statement-breakpoint
CREATE INDEX "contact_restrictions_type_index" ON "contact_restrictions" USING btree ("restriction_type");--> statement-breakpoint
CREATE INDEX "contact_restrictions_status_index" ON "contact_restrictions" USING btree ("status");--> statement-breakpoint
CREATE INDEX "contact_restrictions_timeout_until_index" ON "contact_restrictions" USING btree ("timeout_until");--> statement-breakpoint
CREATE INDEX "messages_contact_id_index" ON "messages" USING btree ("contact_id");--> statement-breakpoint
CREATE INDEX "messages_direction_index" ON "messages" USING btree ("direction");--> statement-breakpoint
CREATE INDEX "messages_intent_index" ON "messages" USING btree ("intent");--> statement-breakpoint
CREATE INDEX "messages_created_at_index" ON "messages" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "messages_external_id_index" ON "messages" USING btree ("external_id");--> statement-breakpoint
CREATE INDEX "contacts_phone_index" ON "contacts" USING btree ("phone");--> statement-breakpoint
CREATE INDEX "contacts_whatsapp_id_index" ON "contacts" USING btree ("whatsapp_id");--> statement-breakpoint
ALTER TABLE "contacts" DROP COLUMN "first_name";--> statement-breakpoint
ALTER TABLE "contacts" DROP COLUMN "middle_name";--> statement-breakpoint
ALTER TABLE "contacts" DROP COLUMN "last_name";--> statement-breakpoint
ALTER TABLE "contacts" DROP COLUMN "email";--> statement-breakpoint
ALTER TABLE "contacts" DROP COLUMN "passport_number";--> statement-breakpoint
ALTER TABLE "contacts" DROP COLUMN "birth_year";--> statement-breakpoint
ALTER TABLE "contacts" DROP COLUMN "gender";--> statement-breakpoint
ALTER TABLE "contacts" DROP COLUMN "title";--> statement-breakpoint
ALTER TABLE "contacts" DROP COLUMN "added_by";--> statement-breakpoint
ALTER TABLE "contacts" ADD CONSTRAINT "contacts_phone_unique" UNIQUE("phone");